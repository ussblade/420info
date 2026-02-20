/**
 * Colorado MED (Marijuana Enforcement Division) licensed retailer scraper.
 * Source: https://sbg.colorado.gov/med-licensed-businesses
 * The MED publishes a regularly updated CSV of all licensed businesses.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// MED publishes a direct CSV download of active licenses
const MED_CSV_URL =
  'https://sbg.colorado.gov/sites/sbg/files/MED%20Licensed%20Businesses.csv';

export async function scrapeColorado(): Promise<ScrapedDispensary[]> {
  console.log('[CO] Fetching MED licensed businesses CSV...');

  let csvText: string;
  try {
    const response = await fetch(MED_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[CO] Failed to fetch MED CSV:', err);
    return [];
  }

  let records: Record<string, string>[];
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (err) {
    console.error('[CO] Failed to parse CSV:', err);
    return [];
  }

  // Filter to retail marijuana stores only
  const retailers = records.filter(r => {
    const type = (r['License Type'] || r['LicenseType'] || '').toLowerCase();
    return type.includes('retail marijuana store');
  });

  console.log(`[CO] Found ${retailers.length} retail marijuana stores`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = row['Licensee Name'] || row['LicenseeName'] || '';
    const licenseNumber = row['License Number'] || row['LicenseNumber'] || '';
    const address = row['License Address'] || row['LicenseAddress'] || '';
    const city = row['City'] || '';
    const zip = row['ZIP'] || row['Zip'] || '';
    const phone = row['Phone'] || '';

    if (!name || !address) continue;

    const fullAddress = `${address}, ${city}, CO ${zip}`;
    let lat: number | undefined;
    let lon: number | undefined;

    // Geocode if we have a full address
    if (address && city) {
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      }
    }

    if (lat === undefined || lon === undefined) {
      console.warn(`[CO] Could not geocode: ${fullAddress}`);
      continue;
    }

    dispensaries.push({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'CO',
      zip: zip.trim(),
      latitude: lat,
      longitude: lon,
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      source: 'scraped',
    });
  }

  console.log(`[CO] Geocoded ${dispensaries.length} dispensaries`);
  return dispensaries;
}
