/**
 * Oregon OLCC (Oregon Liquor and Cannabis Commission) retailer scraper.
 * Source: https://www.oregon.gov/olcc/marijuana/pages/recreational-marijuana-licensee-reports.aspx
 *
 * Actual columns: License Number | Business Licenses | Business Name | SOS Registration Number |
 *                 PhysicalAddress | County | License Type | Expiration Date | Tier | ...
 *
 * PhysicalAddress is a combined field: "5691 SE International Way Ste C MILWAUKIE OR  97222-"
 */

import * as XLSX from 'xlsx';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const OLCC_XLSX_URL =
  'https://www.oregon.gov/olcc/marijuana/Documents/Cannabis-Business-Licenses-All.xlsx';

// Parse "5691 SE International Way Ste C MILWAUKIE OR  97222-" into parts.
// Format: "{street} {CITY IN ALL CAPS} OR  {zip}"
function parsePhysicalAddress(raw: string): {
  address: string;
  city: string;
  zip: string;
} | null {
  // City is all-caps before the state abbreviation OR
  // Match: (street part) (ALL CAPS CITY) OR (zip)
  const match = raw.match(/^(.+?)\s+([A-Z][A-Z\s]+?)\s+OR\s+(\d{5})/);
  if (!match) return null;

  const address = match[1].trim();
  const city = match[2].trim();
  const zip = match[3].trim();

  // Sanity check: address should have a number, city should be reasonable length
  if (!address || city.length > 40 || city.length < 2) return null;

  return { address, city, zip };
}

export async function scrapeOregon(): Promise<ScrapedDispensary[]> {
  console.log('[OR] Fetching OLCC Cannabis-Business-Licenses-All.xlsx...');

  let buffer: ArrayBuffer;
  try {
    const response = await fetch(OLCC_XLSX_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    buffer = await response.arrayBuffer();
  } catch (err) {
    console.error('[OR] Failed to fetch OLCC XLSX:', err);
    return [];
  }

  let records: Record<string, string>[];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
    });
  } catch (err) {
    console.error('[OR] Failed to parse XLSX:', err);
    return [];
  }

  // Log unique license types and a sample expiration date for debugging
  const licenseTypes = [...new Set(records.map(r => r['License Type'] || ''))];
  console.log('[OR] License Types found:', licenseTypes.join(' | '));
  const sample = records.find(r => (r['License Type'] || '').toLowerCase().includes('retailer'));
  if (sample) console.log('[OR] Sample retailer row:', JSON.stringify(sample));

  // Filter to retailers only — no expiration filter (OLCC file includes all statuses)
  const retailers = records.filter(r => {
    const type = (r['License Type'] || '').toLowerCase();
    return type.includes('retailer');
  });

  console.log(`[OR] Found ${retailers.length} marijuana retailers`);

  // Cap to avoid extremely long runs; increase once geocode cache is warm
  const MAX_GEOCODE = 400;
  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    if (dispensaries.length >= MAX_GEOCODE) {
      console.log(`[OR] Hit cap of ${MAX_GEOCODE} — remaining entries will be cached next run`);
      break;
    }
    const name = (row['Business Name'] || row['Business Licenses'] || '').trim();
    if (!name) continue;

    const rawAddress = (row['PhysicalAddress'] || '').trim();
    if (!rawAddress) {
      console.warn(`[OR] Missing address for: ${name}`);
      continue;
    }

    const parsed = parsePhysicalAddress(rawAddress);
    const licenseNumber = (row['License Number'] || '').trim();

    // Skip entries where we can't parse a clean address — raw string geocoding is unreliable
    if (!parsed) {
      console.warn(`[OR] Could not parse address for: ${name} — "${rawAddress}"`);
      continue;
    }

    const geocodeQuery = `${parsed.address}, ${parsed.city}, OR ${parsed.zip}`;
    const coords = await geocodeAddress(geocodeQuery);
    if (!coords) {
      console.warn(`[OR] Could not geocode: ${geocodeQuery}`);
      continue;
    }

    dispensaries.push({
      name,
      address: parsed.address,
      city: parsed.city,
      state: 'OR',
      zip: parsed.zip,
      latitude: coords.lat,
      longitude: coords.lon,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[OR] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
