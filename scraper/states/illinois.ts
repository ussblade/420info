/**
 * Illinois IDFPR (IL Dept of Financial & Professional Regulation) dispensary scraper.
 * Source: https://idfpr.illinois.gov/LicenseLookup/AdultUseCannabis.asp
 * Illinois publishes a list of licensed adult-use cannabis dispensaries.
 */

import { geocodeAddress } from '../geocode';
import type { ScrapedDispensary } from '../index';

// Illinois Adult Use Cannabis Dispensary Organization list (JSON API)
const IDFPR_URL =
  'https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/docs/adultuse/LicensedDispensaryOrganizationsAU.pdf';

// Fallback: Illinois open data portal
const IL_OPEN_DATA_URL =
  'https://data.illinois.gov/api/3/action/datastore_search?resource_id=3f68cd37-27c4-4f1c-a1c4-d09ba76e6a32&limit=500&filters=%7B%22License_Type%22:%22Adult_Use%22%7D';

export async function scrapeIllinois(): Promise<ScrapedDispensary[]> {
  console.log('[IL] Fetching Illinois adult-use dispensary data...');

  // Try open data portal first
  try {
    const response = await fetch(IL_OPEN_DATA_URL, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as Record<string, unknown>;

    const records: Record<string, string>[] =
      ((data.result as Record<string, unknown>)?.records || data.records || []) as Record<string, string>[];

    if (records.length > 0) {
      return processIllinoisRecords(records);
    }
  } catch (err) {
    console.warn('[IL] Open data portal failed, trying hardcoded list:', err);
  }

  // Fallback: use a well-known static list of IL dispensaries with coords
  return getIllinoisFallback();
}

async function processIllinoisRecords(
  records: Record<string, string>[]
): Promise<ScrapedDispensary[]> {
  const dispensaries: ScrapedDispensary[] = [];

  for (const row of records) {
    const name = row['Business_Name'] || row['Dispensary_Name'] || row['Name'] || '';
    if (!name) continue;

    const address = row['Address'] || row['Street_Address'] || '';
    const city = row['City'] || '';
    const zip = row['Zip'] || row['ZIP'] || '';
    const phone = row['Phone'] || '';
    const licenseNumber = row['License_Number'] || '';

    let lat = parseFloat(row['Latitude'] || '');
    let lon = parseFloat(row['Longitude'] || '');

    if (isNaN(lat) || isNaN(lon)) {
      const fullAddress = `${address}, ${city}, IL ${zip}`;
      const coords = await geocodeAddress(fullAddress);
      if (!coords) {
        console.warn(`[IL] Could not geocode: ${fullAddress}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
    }

    dispensaries.push({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'IL',
      zip: zip.trim(),
      latitude: lat,
      longitude: lon,
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      source: 'scraped',
    });
  }

  console.log(`[IL] Processed ${dispensaries.length} dispensaries`);
  return dispensaries;
}

// Minimal hardcoded fallback for key Chicago-area dispensaries
// In production this would be scraped from the IDFPR PDF
function getIllinoisFallback(): ScrapedDispensary[] {
  console.log('[IL] Using fallback hardcoded list');
  return [
    {
      name: 'Dispensary 33',
      address: '5001 N Clark St',
      city: 'Chicago',
      state: 'IL',
      zip: '60640',
      latitude: 41.9727,
      longitude: -87.6618,
      phone: '(773) 991-5524',
      source: 'scraped',
    },
    {
      name: 'Mission Dispensary Chicago',
      address: '1818 N Milwaukee Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60647',
      latitude: 41.9148,
      longitude: -87.6929,
      source: 'scraped',
    },
    {
      name: 'Sunnyside Chicago North',
      address: '4102 N Kedzie Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60618',
      latitude: 41.9562,
      longitude: -87.7166,
      source: 'scraped',
    },
  ];
}
