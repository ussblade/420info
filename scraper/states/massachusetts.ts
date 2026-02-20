/**
 * Massachusetts CCC (Cannabis Control Commission) licensed retailer scraper.
 * Source: https://masscannabiscontrol.com/open-data/data-catalog/
 *
 * Columns: Industry | BUSINESS_NAME | LICENSE_NUMBER | LICENSE_TYPE | LICENSE_STATUS |
 *          ADDRESS_1 | CITY | STATE | ZIP_CODE | BUSINESS_PHONE
 *
 * Filter: LICENSE_TYPE = 'Marijuana Retailer', LICENSE_STATUS = 'Active'
 * Socrata default is 1000 rows — use $limit=10000 to get all.
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const MA_CSV_URL =
  'https://masscannabiscontrol.com/resource/l_licenses_active.csv?$limit=10000';

export async function scrapeMassachusetts(): Promise<ScrapedDispensary[]> {
  console.log('[MA] Fetching CCC active licenses CSV...');

  let csvText: string;
  try {
    const response = await fetch(MA_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[MA] Failed to fetch CSV:', err);
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
    console.error('[MA] Failed to parse CSV:', err);
    return [];
  }

  console.log(`[MA] Total rows: ${records.length}`);

  // Filter to active marijuana retailers only
  const retailers = records.filter(r => {
    const type = (r['LICENSE_TYPE'] || '').trim();
    const status = (r['LICENSE_STATUS'] || '').trim();
    return type === 'Marijuana Retailer' && status === 'Active';
  });

  console.log(`[MA] Found ${retailers.length} active marijuana retailers`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = (row['BUSINESS_NAME'] || '').trim();
    if (!name) continue;

    const address = (row['ADDRESS_1'] || '').trim();
    const city = (row['CITY'] || '').trim();
    const zip = (row['ZIP_CODE'] || '').trim().slice(0, 5);
    const licenseNumber = (row['LICENSE_NUMBER'] || '').trim();
    const phone = (row['BUSINESS_PHONE'] || '').trim();

    if (!address || !city) continue;

    const coords = await geocodeAddress(`${address}, ${city}, MA ${zip}`);
    if (!coords) {
      console.warn(`[MA] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'MA',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      phone: phone || undefined,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[MA] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
