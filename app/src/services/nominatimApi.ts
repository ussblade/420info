/**
 * Nominatim geocoding API (OpenStreetMap).
 * Converts text queries → lat/lng + display name suggestions.
 * Free, no API key. Usage policy: 1 request/sec, identify with User-Agent.
 */

import type { NominatimPlace } from '../types';
import {
  NOMINATIM_URL,
  USER_AGENT,
  NOMINATIM_MAX_RESULTS,
} from '../constants/config';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

/**
 * Search for a location by text query.
 * Returns up to NOMINATIM_MAX_RESULTS suggestions, US only.
 */
export async function searchPlaces(query: string): Promise<NominatimPlace[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    countrycodes: 'us',
    addressdetails: '0',
    limit: String(NOMINATIM_MAX_RESULTS),
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();

    return results.map(r => ({
      placeId: r.place_id,
      displayName: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    }));
  } catch (err) {
    console.warn('[Nominatim] Search failed:', err);
    return [];
  }
}
