/**
 * Colorado MED (Marijuana Enforcement Division) licensed retailer scraper.
 * Source: https://med.colorado.gov/licensee-information-and-lookup-tool/licensed-facilities
 *
 * Actual columns: License Number | Facility Name | DBA | Facility Type | Street | City | ZIP Code | Date Updated
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const MED_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1PqYThJJwGEsrwWvciu9vXosuC0BzAw4YtD03RvlSKzE/export?format=csv&gid=0';

export async function scrapeColorado(): Promise<ScrapedDispensary[]> {
  console.log('[CO] Fetching MED licensed businesses (Google Sheets CSV)...');

  let csvText: string;
  try {
    const response = await fetch(MED_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[CO] Failed to fetch MED sheet:', err);
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
    console.error('[CO] Failed to parse CSV:', err);
    return [];
  }

  // Filter to retail marijuana stores (medical or recreational)
  const retailers = records.filter(r => {
    const type = (r['Facility Type'] || '').toLowerCase();
    return type.includes('retail marijuana store');
  });

  console.log(`[CO] Found ${retailers.length} retail marijuana stores`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    // Use DBA (trade name) if available, fall back to Facility Name
    const name = (row['DBA'] || row['Facility Name'] || '').trim();
    const address = (row['Street'] || '').trim();
    const city = (row['City'] || '').trim();
    const zip = (row['ZIP Code'] || '').trim();
    const licenseNumber = (row['License Number'] || '').trim();

    if (!name || !address || !city) continue;

    const coords = await geocodeAddress(`${address}, ${city}, CO ${zip}`);
    if (!coords) {
      console.warn(`[CO] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'CO',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[CO] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
