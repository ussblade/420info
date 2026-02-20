/**
 * New York OCM (Office of Cannabis Management) licensed retailer scraper.
 * Source: https://data.ny.gov/Economic-Development/Cannabis-Retail-Dispensaries/jskf-tt3q
 *
 * Columns include: License Number | License Type | License Status | Operational Status |
 *                  Entity Name | DBA | Address Line 1 | Address Line 2 | City | State | Zip Code
 *
 * Filter: Type includes 'retail'/'caurd'/'dispensar'/'consumption', Operational Status = 'Operational'
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const NY_CSV_URL =
  'https://data.ny.gov/api/views/jskf-tt3q/rows.csv?accessType=DOWNLOAD';

export async function scrapeNewYork(): Promise<ScrapedDispensary[]> {
  console.log('[NY] Fetching OCM Cannabis Licenses CSV...');

  let csvText: string;
  try {
    const response = await fetch(NY_CSV_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[NY] Failed to fetch CSV:', err);
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
    console.error('[NY] Failed to parse CSV:', err);
    return [];
  }

  console.log(`[NY] Total rows: ${records.length}`);

  // Log unique license types for debugging
  const types = [...new Set(records.map(r => r['License Type'] || ''))];
  console.log('[NY] License types:', types.join(' | '));

  // Filter to retail dispensaries that are actually open
  const retailers = records.filter(r => {
    const type = (r['License Type'] || '').toLowerCase();
    const opStatus = (r['Operational Status'] || '').toLowerCase();
    return (
      (type.includes('retail') ||
        type.includes('caurd') ||
        type.includes('consumption') ||
        type.includes('dispensar')) &&
      opStatus === 'operational'
    );
  });

  console.log(`[NY] Found ${retailers.length} operational retail dispensaries`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = (row['DBA'] || row['Entity Name'] || '').trim();
    if (!name) continue;

    const line1 = (row['Address Line 1'] || '').trim();
    const line2 = (row['Address Line 2'] || '').trim();
    const address = line2 ? `${line1} ${line2}`.trim() : line1;
    const city = (row['City'] || '').trim();
    const zip = (row['Zip Code'] || '').trim().slice(0, 5);
    const licenseNumber = (row['License Number'] || '').trim();

    if (!address || !city) continue;

    const coords = await geocodeAddress(`${address}, ${city}, NY ${zip}`);
    if (!coords) {
      console.warn(`[NY] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'NY',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[NY] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
