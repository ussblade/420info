/**
 * Maine OCP (Office of Cannabis Policy) adult-use licensee scraper.
 * Source: https://www.maine.gov/dafs/ocp/ (date-stamped CSV, discovered each run)
 *
 * Columns: LICENSE | LICENSE_CATEGORY | LICENSE_TYPE | LICENSE_NAME | DBA | LICENSE_STATUS |
 *          LICENSE_ADDRESS | LICENSE_COUNTY | LICENSE_STATE | LICENSE_CITY | LICENSE_WEBSITE | ...
 *
 * The file is denormalized — multiple rows per license (one per business entity member).
 * We deduplicate by LICENSE number and take the first occurrence.
 * Filter: LICENSE_TYPE includes 'store' or 'retail', LICENSE_STATUS = 'Active'
 */

import { parse } from 'csv-parse/sync';
import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

const ME_BASE_URL =
  'https://www.maine.gov/dafs/ocp/sites/maine.gov.dafs.ocp/files/inline-files/';

// Try current month, then fall back up to 3 months earlier
async function findLatestCsvUrl(): Promise<string | null> {
  const now = new Date();
  for (let offset = 0; offset <= 3; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const url = `${ME_BASE_URL}Adult_Use_Establishments_And_Contacts_${year}_${month}_01.csv`;
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': '420nearme-scraper/1.0' },
      });
      if (res.ok) {
        console.log(`[ME] Found CSV: ${url}`);
        return url;
      }
    } catch {
      // try next offset
    }
  }
  return null;
}

export async function scrapeMaine(): Promise<ScrapedDispensary[]> {
  console.log('[ME] Finding latest OCP Adult Use Establishments CSV...');

  const csvUrl = await findLatestCsvUrl();
  if (!csvUrl) {
    console.error('[ME] Could not find a valid CSV URL — skipping');
    return [];
  }

  let csvText: string;
  try {
    const response = await fetch(csvUrl, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    csvText = await response.text();
  } catch (err) {
    console.error('[ME] Failed to fetch CSV:', err);
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
    console.error('[ME] Failed to parse CSV:', err);
    return [];
  }

  console.log(`[ME] Total rows (denormalized): ${records.length}`);

  // Log unique license types for debugging
  const licTypes = [...new Set(records.map(r => r['LICENSE_TYPE'] || ''))];
  console.log('[ME] License types:', licTypes.join(' | '));

  // Deduplicate by LICENSE — the file has one row per business entity member
  const seen = new Set<string>();
  const unique = records.filter(r => {
    const lic = (r['LICENSE'] || '').trim();
    if (!lic || seen.has(lic)) return false;
    seen.add(lic);
    return true;
  });

  // Filter to active adult-use retail storefronts
  const retailers = unique.filter(r => {
    const type = (r['LICENSE_TYPE'] || '').toLowerCase();
    const status = (r['LICENSE_STATUS'] || '').toLowerCase();
    return (type.includes('store') || type.includes('retail')) && status === 'active';
  });

  console.log(`[ME] Found ${retailers.length} active adult-use stores`);

  const dispensaries: ScrapedDispensary[] = [];

  for (const row of retailers) {
    const name = (row['DBA'] || row['LICENSE_NAME'] || '').trim();
    if (!name) continue;

    const rawAddr = (row['LICENSE_ADDRESS'] || '').trim();
    const city = (row['LICENSE_CITY'] || '').trim();
    const licenseNumber = (row['LICENSE'] || '').trim();
    const website = (row['LICENSE_WEBSITE'] || '').trim();

    if (!rawAddr || !city) continue;

    // LICENSE_ADDRESS may include full address e.g. "48 Mechanic Falls Rd, Poland, ME (Androscoggin)"
    // Strip trailing county annotation " (County)" then extract the street portion
    const cleanAddr = rawAddr.replace(/\s*\([^)]*\)\s*$/, '');
    const cityPattern = new RegExp(`,\\s*${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const parts = cleanAddr.split(cityPattern);
    const street = parts.length > 1 ? parts[0].trim() : cleanAddr.split(',')[0].trim();

    if (!street) continue;

    const coords = await geocodeAddress(`${street}, ${city}, ME`);
    if (!coords) {
      console.warn(`[ME] Could not geocode: ${street}, ${city}`);
      continue;
    }

    dispensaries.push({
      name,
      address: street,
      city,
      state: 'ME',
      zip: '',
      latitude: coords.lat,
      longitude: coords.lon,
      website: website || undefined,
      licenseNumber: licenseNumber || undefined,
      source: 'scraped',
    });
  }

  console.log(`[ME] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}
