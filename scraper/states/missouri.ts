/**
 * Missouri DHSS (Dept of Health & Senior Services) licensed dispensary scraper.
 * Source: https://health.mo.gov/safety/cannabis/xls/licensed-dispensary-facilities-508.xlsx
 *
 * Row 0 is a title banner — actual column headers are on row 1.
 * Columns: Medical | Comprehensive | Approved to Operate | License Number | Entity Name |
 *          Fictitious Name | Facility Street | Unit# | City | State | Postal Code |
 *          Contact Information 1 | Contact Information 2 | Contact Phone
 */

import * as XLSX from 'xlsx';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const MO_XLSX_URL =
  'https://health.mo.gov/safety/cannabis/xls/licensed-dispensary-facilities-508.xlsx';

export async function scrapeMissouri(): Promise<ScrapedDispensary[]> {
  console.log('[MO] Fetching DHSS licensed dispensary XLSX...');

  let buffer: ArrayBuffer;
  try {
    const response = await fetch(MO_XLSX_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    buffer = await response.arrayBuffer();
  } catch (err) {
    console.error('[MO] Failed to fetch XLSX:', err);
    return [];
  }

  let records: Record<string, string>[];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // range: 1 skips the title banner in row 0; row 1 becomes the column headers
    records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
      range: 1,
    });
    console.log(`[MO] Parsed ${records.length} dispensary rows`);
  } catch (err) {
    console.error('[MO] Failed to parse XLSX:', err);
    return [];
  }

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of records) {
    // Use Fictitious Name (trade name/DBA) if available, else Entity Name
    const name = (row['Fictitious Name'] || row['Entity Name'] || '').trim();
    if (!name) continue;

    const street = (row['Facility Street'] || '').trim();
    const unit = (row['Unit#'] || '').trim();
    const address = unit ? `${street} ${unit}`.trim() : street;
    const city = (row['City'] || '').trim();
    const zip = (row['Postal Code'] || '').trim().slice(0, 5);
    const licenseNumber = (row['License Number'] || '').trim();
    const phone = (row['Contact Phone'] || '').trim();

    if (!address || !city) continue;

    const coords = await geocodeAddress(`${address}, ${city}, MO ${zip}`);
    if (!coords) {
      console.warn(`[MO] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'MO',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      phone: phone || undefined,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[MO] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
