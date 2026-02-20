/**
 * Oregon OLCC (Oregon Liquor and Cannabis Commission) retailer scraper.
 * Source: https://www.oregon.gov/olcc/marijuana/pages/recreational-marijuana-licensee-reports.aspx
 *
 * OLCC publishes a stable XLSX file of all cannabis business licenses.
 * URL: https://www.oregon.gov/olcc/marijuana/Documents/Cannabis-Business-Licenses-All.xlsx
 * File is overwritten in-place monthly — same URL every time.
 */

import * as XLSX from 'xlsx';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const OLCC_XLSX_URL =
  'https://www.oregon.gov/olcc/marijuana/Documents/Cannabis-Business-Licenses-All.xlsx';

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
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
    });
  } catch (err) {
    console.error('[OR] Failed to parse XLSX:', err);
    return [];
  }

  if (records.length > 0) {
    console.log('[OR] Columns:', Object.keys(records[0]).join(' | '));
    console.log('[OR] Sample row:', JSON.stringify(records[0]));
  }

  // Filter to retailers only
  const retailers = records.filter(r => {
    const type = (
      r['License Type'] ||
      r['LicenseType'] ||
      r['Type'] ||
      ''
    ).toLowerCase();
    return type.includes('retailer');
  });

  console.log(`[OR] Found ${retailers.length} marijuana retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name =
      row['Trade Name'] ||
      row['TradeName'] ||
      row['Business Name'] ||
      row['Licensee'] ||
      '';
    if (!name) continue;

    const address =
      row['Premise Address'] ||
      row['Street Address'] ||
      row['Address'] ||
      row['Premise Street'] ||
      '';
    const city = row['Premise City'] || row['City'] || '';
    const zip = row['Premise Zip'] || row['Zip Code'] || row['Zip'] || '';
    const licenseNumber = row['License Number'] || row['License No'] || '';
    const phone = row['Phone'] || '';

    let lat = parseFloat(row['Latitude'] || row['Lat'] || '');
    let lon = parseFloat(row['Longitude'] || row['Lon'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      if (!address || !city) {
        console.warn(`[OR] Missing address for: ${name}`);
        continue;
      }
      const coords = await geocodeAddress(`${address}, ${city}, OR ${zip}`);
      if (!coords) {
        console.warn(`[OR] Could not geocode: ${address}, ${city}`);
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

  console.log(`[OR] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
