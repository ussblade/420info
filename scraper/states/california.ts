/**
 * California DCC (Department of Cannabis Control) license data scraper.
 * Source: https://search.cannabis.ca.gov/
 * DCC publishes a bulk download of all active licenses as CSV.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// DCC bulk license download — retailer licenses
const DCC_CSV_URL =
  'https://cannabis.ca.gov/wp-content/uploads/sites/2/2021/09/Active_License_Data_as_of_01012025.csv';

// Fallback: try the search API
const DCC_API_URL = 'https://search.cannabis.ca.gov/api/licenses';

export async function scrapeCalifornia(): Promise<ScrapedDispensary[]> {
  console.log('[CA] Fetching DCC active license data...');

  // Try the API endpoint first
  try {
    return await scrapeViaAPI();
  } catch (err) {
    console.warn('[CA] API failed, trying CSV:', err);
  }

  // Fallback to CSV
  try {
    return await scrapeViaCSV();
  } catch (err) {
    console.error('[CA] Both methods failed:', err);
    return [];
  }
}

async function scrapeViaAPI(): Promise<ScrapedDispensary[]> {
  const params = new URLSearchParams({
    license_type: 'Retailer',
    status: 'Active',
    per_page: '1000',
    page: '1',
  });

  const response = await fetch(`${DCC_API_URL}?${params}`, {
    headers: { 'User-Agent': '420nearme-scraper/1.0' },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as Record<string, unknown>;

  const items: Record<string, string>[] = (data.data || data.licenses || data || []) as Record<string, string>[];
  const dispensaries: ScrapedDispensary[] = [];

  for (const item of items) {
    const lat = parseFloat(item.latitude || item.lat || '');
    const lon = parseFloat(item.longitude || item.lng || item.lon || '');
    if (isNaN(lat) || isNaN(lon)) continue;

    dispensaries.push({
      name: (item.business_name || item.name || '').trim(),
      address: (item.premise_address || item.address || '').trim(),
      city: (item.premise_city || item.city || '').trim(),
      state: 'CA',
      zip: (item.premise_zip || item.zip || '').trim(),
      latitude: lat,
      longitude: lon,
      phone: (item.business_phone || item.phone || '').trim() || undefined,
      website: item.website || undefined,
      licenseNumber: (item.license_number || '').trim() || undefined,
      source: 'scraped',
    });
  }

  console.log(`[CA] API: found ${dispensaries.length} retailers`);
  return dispensaries;
}

async function scrapeViaCSV(): Promise<ScrapedDispensary[]> {
  const response = await fetch(DCC_CSV_URL, {
    headers: { 'User-Agent': '420nearme-scraper/1.0' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const csvText = await response.text();

  const records: Record<string, string>[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const retailers = records.filter(r => {
    const type = (r['License Type'] || '').toLowerCase();
    const status = (r['License Status'] || '').toLowerCase();
    return (type.includes('retailer') || type.includes('retail')) && status === 'active';
  });

  console.log(`[CA] CSV: found ${retailers.length} active retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = row['Business Name'] || row['DBA Name'] || '';
    if (!name) continue;

    const address = row['Premise Address'] || row['Address'] || '';
    const city = row['Premise City'] || row['City'] || '';
    const zip = row['Premise Zip'] || row['ZIP'] || '';
    const licenseNumber = row['License Number'] || '';

    let lat = parseFloat(row['Latitude'] || '');
    let lon = parseFloat(row['Longitude'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      const fullAddress = `${address}, ${city}, CA ${zip}`;
      const coords = await geocodeAddress(fullAddress);
      if (!coords) {
        console.warn(`[CA] Could not geocode: ${fullAddress}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
    }

    dispensaries.push({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'CA',
      zip: zip.trim(),
      latitude: lat,
      longitude: lon,
      licenseNumber: licenseNumber.trim() || undefined,
      source: 'scraped',
    });
  }

  return dispensaries;
}
