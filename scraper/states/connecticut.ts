/**
 * Connecticut DCP (Department of Consumer Protection) cannabis licensee scraper.
 * Source: https://data.ct.gov/api/views/vw4a-3bnz/rows.csv?accessType=DOWNLOAD
 *
 * Columns: Type | License | Business | DBA | Street Address | City | ZIPCode | WebAddress | Geolocation
 *
 * Geolocation is WKT POINT format: "POINT (-72.67993 41.64271)" — lon, lat order.
 * When WKT is present we skip the Nominatim API entirely.
 * Filter: Type includes 'retail'
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const CT_CSV_URL =
  'https://data.ct.gov/api/views/vw4a-3bnz/rows.csv?accessType=DOWNLOAD';

function parseWkt(wkt: string): { lat: number; lon: number } | null {
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!match) return null;
  return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

export async function scrapeConnecticut(): Promise<ScrapedDispensary[]> {
  console.log('[CT] Fetching DCP Cannabis Licensees CSV...');

  let csvText: string;
  try {
    const response = await fetch(CT_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[CT] Failed to fetch CSV:', err);
    return [];
  }

  let records: Record<string, string>[];
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (err) {
    console.error('[CT] Failed to parse CSV:', err);
    return [];
  }

  console.log(`[CT] Total rows: ${records.length}`);

  // Log unique license types for debugging
  const types = [...new Set(records.map(r => r['Type'] || ''))];
  console.log('[CT] License types:', types.join(' | '));

  // Filter to retailer types
  const retailers = records.filter(r => {
    const type = (r['Type'] || '').toLowerCase();
    return type.includes('retail');
  });

  console.log(`[CT] Found ${retailers.length} cannabis retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = (row['DBA'] || row['Business'] || '').trim();
    if (!name) continue;

    const address = (row['Street Address'] || '').trim();
    const city = (row['City'] || '').trim();
    const zip = (row['ZIPCode'] || '').trim().slice(0, 5);
    const licenseNumber = (row['License'] || '').trim();
    const website = (row['WebAddress'] || '').trim();

    if (!address || !city) continue;

    // Use embedded WKT coordinates when available — no geocode API call needed
    const wkt = (row['Geolocation'] || '').trim();
    const coords = wkt
      ? parseWkt(wkt)
      : await geocodeAddress(`${address}, ${city}, CT ${zip}`);

    if (!coords) {
      console.warn(`[CT] Could not get coords for: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'CT',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      website: website || undefined,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[CT] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
