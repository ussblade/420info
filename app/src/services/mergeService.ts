/**
 * Merge + deduplication of scraped official data and OSM results.
 *
 * Strategy:
 *   - Scraped data is the primary source (official license info, verified addresses)
 *   - For each OSM entry, only add it if no scraped entry exists within DEDUP_THRESHOLD_MILES
 *   - Attach user distance and sort closest-first
 */

import type { Dispensary } from '../types';
import { calculateDistanceMiles } from '../utils/distance';
import { DEDUP_THRESHOLD_MILES } from '../constants/config';

/**
 * Filter scraped dispensaries to those within `radiusMiles` of the user.
 */
function filterByRadius(
  dispensaries: Dispensary[],
  userLat: number,
  userLon: number,
  radiusMiles: number
): Dispensary[] {
  return dispensaries.filter(d => {
    const dist = calculateDistanceMiles(userLat, userLon, d.latitude, d.longitude);
    return dist <= radiusMiles;
  });
}

/**
 * Merge scraped official data with live OSM results.
 * OSM entries are added only if they are not within DEDUP_THRESHOLD_MILES of any scraped entry.
 * Result is sorted by distance (ascending) from user location.
 *
 * @param scraped  Official state licensing data (already filtered to radius)
 * @param osm      Live OSM results
 * @param userLat  User latitude
 * @param userLon  User longitude
 * @param radiusMiles  Max distance to include (miles). OSM data pre-filtered to this radius by the API.
 */
export function mergeDispensaries(
  scraped: Dispensary[],
  osm: Dispensary[],
  userLat: number,
  userLon: number,
  radiusMiles: number = 10
): Dispensary[] {
  // Start with all scraped entries in radius
  const nearbyScraped = filterByRadius(scraped, userLat, userLon, radiusMiles);
  const merged: Dispensary[] = [...nearbyScraped];

  // Add OSM entries that don't duplicate a scraped entry
  for (const osmEntry of osm) {
    const isDuplicate = nearbyScraped.some(
      s =>
        calculateDistanceMiles(
          s.latitude,
          s.longitude,
          osmEntry.latitude,
          osmEntry.longitude
        ) < DEDUP_THRESHOLD_MILES
    );

    if (!isDuplicate) {
      merged.push({ ...osmEntry, source: 'osm' });
    }
  }

  // Attach distances and sort closest-first
  return merged
    .map(d => ({
      ...d,
      distanceMiles: calculateDistanceMiles(userLat, userLon, d.latitude, d.longitude),
    }))
    .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
}
