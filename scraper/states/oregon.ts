/**
 * Oregon OLCC (Oregon Liquor and Cannabis Commission) retailer scraper.
 * Source: https://www.oregon.gov/olcc/marijuana/Pages/Approved-Marijuana-Licenses.aspx
 * OLCC publishes a weekly CSV of approved marijuana licenses.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// OLCC weekly license CSV
const OLCC_CSV_URL =
  'https://www.oregon.gov/olcc/marijuana/Documents/Approved_License_List.csv';

export async function scrapeOregon(): Promise<ScrapedDispensary[]> {
  console.log('[OR] Fetching OLCC approved license CSV...');

  let csvText: string;
  try {
    const response = await fetch(OLCC_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[OR] Failed to fetch OLCC CSV:', err);
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
    console.error('[OR] Failed to parse CSV:', err);
    return [];
  }

  // Filter to recreational retailers (license type = "Recreational Marijuana Retailer")
  const retailers = records.filter(r => {
    const type = (r['License Type'] || r['LicenseType'] || '').toLowerCase();
    return type.includes('retailer');
  });

  console.log(`[OR] Found ${retailers.length} marijuana retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = row['Trade Name'] || row['Business Name'] || row['Licensee Name'] || '';
    if (!name) continue;

    const address = row['Street Address'] || row['Address'] || '';
    const city = row['City'] || '';
    const zip = row['Zip Code'] || row['ZIP'] || '';
    const licenseNumber = row['License Number'] || '';
    const phone = row['Phone'] || '';

    let lat = parseFloat(row['Latitude'] || '');
    let lon = parseFloat(row['Longitude'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      const fullAddress = `${address}, ${city}, OR ${zip}`;
      const coords = await geocodeAddress(fullAddress);
      if (!coords) {
        console.warn(`[OR] Could not geocode: ${fullAddress}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
    }

    dispensaries.push({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'OR',
      zip: zip.trim(),
      latitude: lat,
      longitude: lon,
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      source: 'scraped',
    });
  }

  console.log(`[OR] Geocoded ${dispensaries.length} dispensaries`);
  return dispensaries;
}
