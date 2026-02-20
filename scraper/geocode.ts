/**
 * Nominatim geocoding for addresses missing lat/lng.
 * Respects Nominatim usage policy: 1 req/sec max.
 */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = '420nearme-scraper/1.0 (github.com/YOUR_USERNAME/420nearme)';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  await sleep(1100); // Nominatim rate limit: max 1 req/sec

  const params = new URLSearchParams({
    q: address,
    format: 'json',
    countrycodes: 'us',
    limit: '1',
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.warn(`Geocode HTTP ${response.status} for: ${address}`);
      return null;
    }

    const results = (await response.json()) as NominatimResult[];
    if (results.length === 0) return null;

    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon),
    };
  } catch (err) {
    console.warn(`Geocode failed for "${address}":`, err);
    return null;
  }
}
