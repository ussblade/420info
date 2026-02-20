/**
 * Live OpenStreetMap Overpass API query for nearby cannabis dispensaries.
 * Used to fill geographic gaps not covered by the scraped official data.
 */

import type { Dispensary } from '../types';
import { OVERPASS_API_URL, SEARCH_RADIUS_METERS, OVERPASS_TIMEOUT_SECONDS } from '../constants/config';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(lat: number, lon: number, radius: number, timeout: number): string {
  return `[out:json][timeout:${timeout}];
(
  node["shop"="cannabis"](around:${radius},${lat},${lon});
  way["shop"="cannabis"](around:${radius},${lat},${lon});
  node["shop"="marijuana"](around:${radius},${lat},${lon});
  way["shop"="marijuana"](around:${radius},${lat},${lon});
  node["amenity"="cannabis"](around:${radius},${lat},${lon});
  node["cannabis"="retail"](around:${radius},${lat},${lon});
  way["cannabis"="retail"](around:${radius},${lat},${lon});
);
out body center;`;
}

function elementToDispensary(el: OverpassElement): Dispensary | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const tags = el.tags ?? {};
  const name = tags['name'] || tags['brand'] || 'Cannabis Dispensary';

  // Build address from OSM addr:* tags
  const houseNumber = tags['addr:housenumber'] || '';
  const street = tags['addr:street'] || '';
  const city = tags['addr:city'] || '';
  const state = tags['addr:state'] || '';
  const postcode = tags['addr:postcode'] || '';

  const address = houseNumber && street ? `${houseNumber} ${street}` : street;

  return {
    id: `osm-${el.id}`,
    name,
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    zip: postcode.trim(),
    latitude: lat,
    longitude: lon,
    phone: tags['phone'] || tags['contact:phone'] || undefined,
    website: tags['website'] || tags['contact:website'] || undefined,
    openingHours: tags['opening_hours'] || undefined,
    source: 'osm',
  };
}

/**
 * Query Overpass for cannabis dispensaries near a coordinate.
 * Returns empty array on any error — failures here are non-fatal
 * since scraped data is the primary source.
 */
export async function queryOverpass(
  lat: number,
  lon: number,
  radiusMeters: number = SEARCH_RADIUS_METERS
): Promise<Dispensary[]> {
  const query = buildQuery(lat, lon, radiusMeters, OVERPASS_TIMEOUT_SECONDS);

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass HTTP ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    const results = data.elements
      .map(elementToDispensary)
      .filter((d): d is Dispensary => d !== null);

    console.log(`[Overpass] ${results.length} OSM results for (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    return results;
  } catch (err) {
    console.warn('[Overpass] Query failed:', err);
    return [];
  }
}
