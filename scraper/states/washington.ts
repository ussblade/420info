/**
 * Washington WSLCB (WA State Liquor and Cannabis Board) retailer scraper.
 * Source: https://lcb.wa.gov/records/frequently-requested-lists
 * WSLCB publishes a regularly updated list of licensed cannabis retailers.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// WSLCB licensed cannabis retailer list (CSV)
const WSLCB_CSV_URL =
  'https://lcb.wa.gov/sites/default/files/publications/Licensing/cannabis/cannabis_licensees.csv';

export async function scrapeWashington(): Promise<ScrapedDispensary[]> {
  console.log('[WA] Fetching WSLCB cannabis licensee CSV...');

  let csvText: string;
  try {
    const response = await fetch(WSLCB_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[WA] Failed to fetch WSLCB CSV:', err);
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
    console.error('[WA] Failed to parse CSV:', err);
    return [];
  }

  // Filter to cannabis retailers only
  const retailers = records.filter(r => {
    const type = (r['Privilege'] || r['License Type'] || r['Type'] || '').toLowerCase();
    return type.includes('cannabis retailer') || type.includes('retail cannabis');
  });

  console.log(`[WA] Found ${retailers.length} cannabis retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name =
      row['Tradename'] || row['Trade Name'] || row['Business Name'] || row['Name'] || '';
    if (!name) continue;

    const address =
      row['Premise Street'] || row['Street Address'] || row['Address'] || '';
    const city = row['Premise City'] || row['City'] || '';
    const zip = row['Premise Zip'] || row['Zip Code'] || '';
    const licenseNumber = row['License Number'] || '';
    const phone = row['Phone Number'] || row['Phone'] || '';

    let lat = parseFloat(row['Latitude'] || '');
    let lon = parseFloat(row['Longitude'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      const fullAddress = `${address}, ${city}, WA ${zip}`;
      const coords = await geocodeAddress(fullAddress);
      if (!coords) {
        console.warn(`[WA] Could not geocode: ${fullAddress}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
    }

    dispensaries.push({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'WA',
      zip: zip.trim(),
      latitude: lat,
      longitude: lon,
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      source: 'scraped',
    });
  }

  console.log(`[WA] Geocoded ${dispensaries.length} dispensaries`);
  return dispensaries;
}
