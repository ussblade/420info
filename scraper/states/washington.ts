/**
 * Washington WSLCB (WA State Liquor and Cannabis Board) retailer scraper.
 * Source: https://lcb.wa.gov/records/frequently-requested-lists
 *
 * WSLCB publishes a date-stamped XLSX updated ~mid-month.
 * The filename changes each month (e.g. CannabisApplicants02172026.xlsx),
 * so we scrape the landing page first to find the current link.
 */

import * as XLSX from 'xlsx';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const WSLCB_PAGE_URL = 'https://lcb.wa.gov/records/frequently-requested-lists';
const WSLCB_BASE_URL = 'https://lcb.wa.gov';

async function getCurrentXlsxUrl(): Promise<string | null> {
  try {
    const response = await fetch(WSLCB_PAGE_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // Find href matching CannabisApplicants*.xlsx
    const match = html.match(/href="([^"]*CannabisApplicants[^"]*\.xlsx)"/i);
    if (!match) {
      console.warn('[WA] Could not find CannabisApplicants link on page');
      return null;
    }

    const href = match[1];
    // Make absolute if relative
    return href.startsWith('http') ? href : `${WSLCB_BASE_URL}${href}`;
  } catch (err) {
    console.error('[WA] Failed to fetch WSLCB page:', err);
    return null;
  }
}

export async function scrapeWashington(): Promise<ScrapedDispensary[]> {
  console.log('[WA] Finding current WSLCB XLSX URL...');

  const xlsxUrl = await getCurrentXlsxUrl();
  if (!xlsxUrl) {
    console.error('[WA] Could not determine XLSX URL — skipping');
    return [];
  }

  console.log(`[WA] Downloading: ${xlsxUrl}`);

  let buffer: ArrayBuffer;
  try {
    const response = await fetch(xlsxUrl, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    buffer = await response.arrayBuffer();
  } catch (err) {
    console.error('[WA] Failed to download XLSX:', err);
    return [];
  }

  let records: Record<string, string>[];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    // The file has multiple sheets; find one with retailer data
    const targetSheet =
      workbook.SheetNames.find(n => /license|applicant|retailer/i.test(n)) ||
      workbook.SheetNames[0];
    const sheet = workbook.Sheets[targetSheet];
    records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
    });
    console.log(`[WA] Using sheet: "${targetSheet}" (${records.length} rows)`);
  } catch (err) {
    console.error('[WA] Failed to parse XLSX:', err);
    return [];
  }

  if (records.length > 0) {
    console.log('[WA] Columns:', Object.keys(records[0]).join(' | '));
    console.log('[WA] Sample row:', JSON.stringify(records[0]));
  }

  // Filter: active cannabis retailers
  const retailers = records.filter(r => {
    const privilege = (
      r['Privilege'] ||
      r['License Type'] ||
      r['Type'] ||
      r['Privilege Description'] ||
      ''
    ).toLowerCase();
    const status = (r['License Status'] || r['Status'] || '').toLowerCase();

    const isRetailer =
      privilege.includes('cannabis retailer') ||
      privilege.includes('retail cannabis') ||
      privilege.includes('marijuana retailer');
    const isActive =
      !status ||
      status === 'active' ||
      status.includes('active') ||
      status.includes('issued');

    return isRetailer && isActive;
  });

  console.log(`[WA] Found ${retailers.length} active cannabis retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name =
      row['Tradename'] ||
      row['Trade Name'] ||
      row['Business Name'] ||
      row['Name'] ||
      '';
    if (!name) continue;

    const address =
      row['Premise Street'] ||
      row['Street Address'] ||
      row['Premise Address'] ||
      row['Address'] ||
      '';
    const city =
      row['Premise City'] || row['City'] || '';
    const zip =
      row['Premise Zip'] || row['Zip Code'] || row['Zip'] || '';
    const licenseNumber =
      row['License Number'] || row['UBI'] || '';
    const phone =
      row['Phone Number'] || row['Phone'] || '';

    let lat = parseFloat(row['Latitude'] || row['Lat'] || '');
    let lon = parseFloat(row['Longitude'] || row['Long'] || row['Lon'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      if (!address || !city) {
        console.warn(`[WA] Missing address for: ${name}`);
        continue;
      }
      const coords = await geocodeAddress(`${address}, ${city}, WA ${zip}`);
      if (!coords) {
        console.warn(`[WA] Could not geocode: ${address}, ${city}`);
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

  console.log(`[WA] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
