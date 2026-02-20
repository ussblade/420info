/**
 * Colorado MED (Marijuana Enforcement Division) licensed retailer scraper.
 * Source: https://med.colorado.gov/licensee-information-and-lookup-tool/licensed-facilities
 *
 * Actual columns: License Number | Facility Name | DBA | Facility Type | Street | City | ZIP Code | Date Updated
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// Same workbook, two tabs:
// gid=0           → Medical Marijuana Stores
// gid=1679153291  → Retail Marijuana Stores (recreational)
const MED_MEDICAL_URL =
  'https://docs.google.com/spreadsheets/d/1PqYThJJwGEsrwWvciu9vXosuC0BzAw4YtD03RvlSKzE/export?format=csv&gid=0';
const MED_RETAIL_URL =
  'https://docs.google.com/spreadsheets/d/1PqYThJJwGEsrwWvciu9vXosuC0BzAw4YtD03RvlSKzE/export?format=csv&gid=1679153291';

async function fetchAndParseSheet(url: string, label: string): Promise<Record<string, string>[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();
    return parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (err) {
    console.error(`[CO] Failed to fetch ${label}:`, err);
    return [];
  }
}

export async function scrapeColorado(): Promise<ScrapedDispensary[]> {
  console.log('[CO] Fetching MED Medical + Retail Marijuana Store tabs...');

  const [medicalRecords, retailRecords] = await Promise.all([
    fetchAndParseSheet(MED_MEDICAL_URL, 'Medical tab'),
    fetchAndParseSheet(MED_RETAIL_URL, 'Retail tab'),
  ]);

  console.log(`[CO] Medical rows: ${medicalRecords.length}, Retail rows: ${retailRecords.length}`);

  // Combine and filter to store types only
  const allRecords = [...medicalRecords, ...retailRecords];
  const retailers = allRecords.filter(r => {
    const type = (r['Facility Type'] || '').toLowerCase();
    return type.includes('marijuana store');
  });

  console.log(`[CO] Found ${retailers.length} total marijuana stores (medical + retail)`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    // Use DBA (trade name) if available, fall back to Facility Name
    const name = (row['DBA'] || row['Facility Name'] || '').trim();
    const address = (row['Street'] || '').trim();
    const city = (row['City'] || '').trim();
    const zip = (row['ZIP Code'] || '').trim();
    const licenseNumber = (row['License Number'] || '').trim();

    if (!name || !address || !city) continue;

    const coords = await geocodeAddress(`${address}, ${city}, CO ${zip}`);
    if (!coords) {
      console.warn(`[CO] Could not geocode: ${address}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address,
      city,
      state: 'CO',
      zip,
      latitude: coords.lat,
      longitude: coords.lon,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[CO] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
