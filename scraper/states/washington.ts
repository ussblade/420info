/**
 * Washington WSLCB (WA State Liquor and Cannabis Board) retailer scraper.
 * Source: https://lcb.wa.gov/records/frequently-requested-lists
 *
 * Actual columns: Tradename | License  | UBI | Street Address | Suite Rm |
 *                 City | State | county | Zip Code | Priv Desc | Privilege Status | Day Phone
 *
 * Filter: Priv Desc = "CANNABIS RETAILER", Privilege Status = "ACTIVE ..." (not CLOSED)
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

    const match = html.match(/href="([^"]*CannabisApplicants[^"]*\.xlsx)"/i);
    if (!match) {
      console.warn('[WA] Could not find CannabisApplicants link on page');
      return null;
    }

    const href = match[1];
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
    const targetSheet =
      workbook.SheetNames.find(n => /retailer/i.test(n)) ||
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

  // Filter: CANNABIS RETAILER privilege, not closed
  const retailers = records.filter(r => {
    const priv = (r['Priv Desc'] || '').trim().toUpperCase();
    const status = (r['Privilege Status'] || '').trim().toUpperCase();
    return (
      priv === 'CANNABIS RETAILER' &&
      !status.includes('CLOSED') &&
      !status.includes('CANCELLED') &&
      !status.includes('REVOKED') &&
      !status.includes('EXPIRED')
    );
  });

  console.log(`[WA] Found ${retailers.length} active cannabis retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = (row['Tradename'] || '').trim();
    if (!name) continue;

    const street = (row['Street Address'] || '').trim();
    const suite = (row['Suite Rm'] || '').trim();
    const address = suite ? `${street} ${suite}`.trim() : street;
    const city = (row['City'] || '').trim();
    // Zip Code may have extra digits (e.g. "981038924") — take first 5
    const zip = (row['Zip Code'] || '').trim().slice(0, 5);
    const licenseNumber = (row['License '] || '').trim(); // note trailing space in column name
    const phone = (row['Day Phone'] || '').trim();

    if (!address || !city) {
      console.warn(`[WA] Missing address for: ${name}`);
      continue;
    }

    const coords = await geocodeAddress(`${address}, ${city}, WA ${zip}`);
    if (!coords) {
      console.warn(`[WA] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'WA',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      phone: phone || undefined,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[WA] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
