/**
 * App-wide configuration constants.
 * Update CDN_URL after setting up GitHub Pages.
 */

/**
 * URL for the scraped dispensaries JSON hosted on GitHub Pages.
 * Replace YOUR_USERNAME with your GitHub username.
 */
export const CDN_URL =
  'https://ussblade.github.io/420info/dispensaries.json';

/** Search radius in meters for Overpass API queries */
export const SEARCH_RADIUS_METERS = 16093; // ~10 miles

/** How many hours before we re-fetch the CDN JSON (cache TTL) */
export const CACHE_TTL_HOURS = 24;

/** AsyncStorage key for the cached dispensary data */
export const CACHE_KEY_DATA = '@420nearme/dispensaries_cache';

/** AsyncStorage key for the cache timestamp */
export const CACHE_KEY_TIMESTAMP = '@420nearme/dispensaries_cache_ts';

/**
 * Deduplication threshold: if a scraped dispensary and an OSM node are
 * within this many miles, they're considered the same location.
 * ~100 meters = 0.062 miles
 */
export const DEDUP_THRESHOLD_MILES = 0.062;

/** Overpass API endpoint */
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/** Overpass query timeout in seconds */
export const OVERPASS_TIMEOUT_SECONDS = 25;

/** Nominatim geocoding API */
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** User-Agent header required by Nominatim usage policy */
export const USER_AGENT = '420nearme/1.0 (github.com/ussblade/420info)';

/** Debounce delay for search input in ms */
export const SEARCH_DEBOUNCE_MS = 600;

/** Max number of Nominatim suggestions to show */
export const NOMINATIM_MAX_RESULTS = 5;
