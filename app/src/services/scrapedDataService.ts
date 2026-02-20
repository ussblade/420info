/**
 * Fetches the pre-built dispensaries.json from GitHub Pages CDN.
 * Caches in AsyncStorage with a 24-hour TTL.
 * Falls back to stale cache when offline.
 * Falls back to empty array on first launch + offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Dispensary, ScrapedDataResponse } from '../types';
import {
  CDN_URL,
  CACHE_KEY_DATA,
  CACHE_KEY_TIMESTAMP,
  CACHE_TTL_HOURS,
} from '../constants/config';

function isCacheExpired(timestamp: string | null): boolean {
  if (!timestamp) return true;
  const cached = new Date(timestamp).getTime();
  const now = Date.now();
  const ageMs = now - cached;
  const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;
  return ageMs > ttlMs;
}

async function loadFromCache(): Promise<Dispensary[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_DATA);
    if (!cached) return null;
    const parsed: Dispensary[] = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function saveToCache(dispensaries: Dispensary[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY_DATA, JSON.stringify(dispensaries));
    await AsyncStorage.setItem(CACHE_KEY_TIMESTAMP, new Date().toISOString());
  } catch (err) {
    console.warn('[ScrapedDataService] Failed to save cache:', err);
  }
}

/**
 * Fetch scraped dispensary data.
 * Returns cached data if fresh; fetches from CDN if stale or missing.
 * Never throws — returns empty array on total failure.
 */
export async function fetchScrapedDispensaries(): Promise<Dispensary[]> {
  // Check cache age
  const timestamp = await AsyncStorage.getItem(CACHE_KEY_TIMESTAMP).catch(() => null);

  if (!isCacheExpired(timestamp)) {
    const cached = await loadFromCache();
    if (cached) {
      console.log(`[ScrapedDataService] Cache hit (${cached.length} entries)`);
      return cached;
    }
  }

  // Attempt network fetch
  try {
    console.log('[ScrapedDataService] Fetching from CDN:', CDN_URL);
    const response = await fetch(CDN_URL, {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: ScrapedDataResponse = await response.json();
    const dispensaries = data.dispensaries ?? [];

    await saveToCache(dispensaries);
    console.log(`[ScrapedDataService] Fetched ${dispensaries.length} dispensaries from CDN`);
    return dispensaries;
  } catch (err) {
    console.warn('[ScrapedDataService] Network fetch failed:', err);

    // Fallback: return stale cache if available
    const stale = await loadFromCache();
    if (stale) {
      console.log(`[ScrapedDataService] Using stale cache (${stale.length} entries)`);
      return stale;
    }

    console.warn('[ScrapedDataService] No cache available; returning empty array');
    return [];
  }
}
