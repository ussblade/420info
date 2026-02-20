/**
 * Nominatim geocoding with a persistent file-based cache.
 *
 * On first run, every address is geocoded (~25 min for OR+WA).
 * On subsequent monthly runs, only NEW addresses hit the API.
 * The cache is committed to the repo as scraper/output/geocode-cache.json.
 */

import * as fs from 'fs';
import * as path from 'path';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeoCache {
  [address: string]: { lat: number; lon: number } | null;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = '420nearme-scraper/1.0 (github.com/ussblade/420info)';
const CACHE_FILE = path.join(__dirname, 'output', 'geocode-cache.json');

// In-memory cache — loaded once at startup, saved at end
let cache: GeoCache = {};
let cacheLoaded = false;
let pendingWrites = 0;

export function loadGeoCache(): void {
  if (cacheLoaded) return;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) as GeoCache;
      console.log(`[Geocode] Cache loaded: ${Object.keys(cache).length} entries`);
    } else {
      console.log('[Geocode] No cache file found — starting fresh');
    }
  } catch {
    console.warn('[Geocode] Failed to load cache — starting fresh');
    cache = {};
  }
  cacheLoaded = true;
}

export function saveGeoCache(): void {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    console.log(`[Geocode] Cache saved: ${Object.keys(cache).length} entries (${pendingWrites} new)`);
  } catch (err) {
    console.warn('[Geocode] Failed to save cache:', err);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const key = address.trim().toLowerCase();

  // Cache hit — no API call needed
  if (cacheLoaded && key in cache) {
    return cache[key];
  }

  await sleep(1100); // Nominatim: max 1 req/sec

  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    countrycodes: 'us',
    limit: '1',
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    });

    if (!response.ok) {
      console.warn(`[Geocode] HTTP ${response.status} for: ${address}`);
      cache[key] = null;
      return null;
    }

    const results = (await response.json()) as NominatimResult[];

    if (results.length === 0) {
      cache[key] = null;
      return null;
    }

    const result = { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
    cache[key] = result;
    pendingWrites++;
    return result;
  } catch (err) {
    console.warn(`[Geocode] Failed for "${address}":`, err);
    cache[key] = null;
    return null;
  }
}
