/**
 * Colorado MED (Marijuana Enforcement Division) licensed retailer scraper.
 * Source: https://med.colorado.gov/licensee-information-and-lookup-tool/licensed-facilities
 *
 * The MED maintains a public Google Sheet of licensed facilities.
 * We export it as CSV directly — no auth required.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// MED public Google Sheet → CSV export
// Sheet ID sourced from: https://med.colorado.gov/licensee-information-and-lookup-tool/licensed-facilities
const MED_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1PqYThJJwGEsrwWvciu9vXosuC0BzAw4YtD03RvlSKzE/export?format=csv&gid=0';

export async function scrapeColorado(): Promise<ScrapedDispensary[]> {
  console.log('[CO] Fetching MED licensed businesses (Google Sheets CSV)...');

  let csvText: string;
  try {
    const response = await fetch(MED_CSV_URL, {
      headers: {
        'User-Agent': '420nearme-scraper/1.0',
        // Google redirects; follow redirects (default in Node fetch)
      },
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

  // Filter to retail marijuana stores
  const retailers = records.filter(r => {
    const type = Object.values(r).join(' ').toLowerCase();
    return type.includes('retail') && type.includes('marijuana');
  });

  console.log(`[CO] Found ${retailers.length} retail marijuana stores`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    // Column names vary — try common variants
    const name =
      row['Trade Name'] || row['Licensee'] || row['Business Name'] || row['Name'] || '';
    const address =
      row['Street Address'] || row['Address'] || row['Premise Address'] || '';
    const city = row['City'] || '';
    const zip = row['Zip'] || row['ZIP'] || row['Postal Code'] || '';
    const licenseNumber = row['License Number'] || row['License No'] || '';
    const phone = row['Phone'] || '';

    if (!name || !address || !city) continue;

    let lat = parseFloat(row['Latitude'] || row['Lat'] || '');
    let lon = parseFloat(row['Longitude'] || row['Long'] || row['Lon'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      const coords = await geocodeAddress(`${address}, ${city}, CO ${zip}`);
      if (!coords) {
        console.warn(`[CO] Could not geocode: ${address}, ${city}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
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

  console.log(`[CO] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
