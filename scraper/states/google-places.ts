/**
 * Google Places API scraper for states without official machine-readable licensing data.
 * Covers 16 states: AZ, NV, NJ, MI, VT, RI, OH, MN, VA, AK, MT, DE, NM, FL, OK, PA
 *
 * Requires: GOOGLE_PLACES_API_KEY environment variable (set as GitHub Actions secret)
 * Uses: Places API Text Search — returns name, address, lat/lng, rating, review count
 * Rate: 200ms between requests (5 req/sec, well under 600/min limit)
 * Cost: ~300 queries/month, negligible within free tier
 */

import type { ScrapedDispensary } from '../index';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// States and major cities to query.
// Official scrapers already cover: CO, OR, WA, IL, NY, MO, CT, ME, MA
const COVERAGE: Record<string, string[]> = {
  AZ: [
    'Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert',
    'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Flagstaff', 'Avondale', 'Goodyear',
    'Lake Havasu City', 'Prescott', 'Kingman', 'Sierra Vista', 'Casa Grande', 'Bullhead City',
  ],
  NV: [
    'Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City',
    'Boulder City', 'Mesquite', 'Elko', 'Laughlin',
  ],
  NJ: [
    'Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Camden',
    'Clifton', 'Atlantic City', 'Cherry Hill', 'Edison', 'Toms River',
    'Brick', 'Woodbridge', 'Lakewood', 'Hamilton', 'Bayonne', 'Hoboken',
    'Passaic', 'Union City', 'East Orange',
  ],
  MI: [
    'Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor',
    'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Westland', 'Troy',
    'Kalamazoo', 'Farmington Hills', 'Pontiac', 'Muskegon', 'Saginaw',
    'Battle Creek', 'Bay City', 'Holland', 'Traverse City',
  ],
  VT: [
    'Burlington', 'Rutland', 'South Burlington', 'Montpelier', 'Barre',
    'Brattleboro', 'St. Johnsbury', 'Bennington', 'Middlebury', 'Stowe',
  ],
  RI: [
    'Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence',
    'Woonsocket', 'North Providence', 'Cumberland', 'Westerly', 'Newport',
  ],
  OH: [
    'Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton',
    'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield',
    'Kettering', 'Elyria', 'Lakewood', 'Dublin', 'Newark', 'Middletown',
    'Mentor', 'Strongsville',
  ],
  MN: [
    'Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington',
    'Brooklyn Park', 'Plymouth', 'St. Cloud', 'Eagan', 'Coon Rapids',
    'Burnsville', 'Eden Prairie', 'Maple Grove', 'Woodbury', 'Blaine',
  ],
  VA: [
    'Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News',
    'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth', 'Suffolk',
    'Lynchburg', 'Harrisonburg', 'Charlottesville', 'Fredericksburg', 'Danville',
  ],
  AK: [
    'Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan',
    'Wasilla', 'Kenai', 'Kodiak', 'Palmer',
  ],
  MT: [
    'Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte',
    'Helena', 'Kalispell', 'Havre', 'Belgrade', 'Whitefish',
  ],
  DE: [
    'Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna',
    'Milford', 'Seaford', 'Rehoboth Beach', 'Georgetown',
  ],
  NM: [
    'Albuquerque', 'Santa Fe', 'Las Cruces', 'Rio Rancho', 'Roswell',
    'Farmington', 'Alamogordo', 'Clovis', 'Hobbs', 'Carlsbad',
    'Gallup', 'Taos', 'Sunland Park', 'Santa Teresa', 'Silver City',
  ],
  FL: [
    'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg',
    'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie',
    'Cape Coral', 'Gainesville', 'Hollywood', 'Clearwater', 'Lakeland',
    'Daytona Beach', 'Sarasota', 'Fort Myers', 'West Palm Beach', 'Ocala',
    'Pensacola', 'Boca Raton', 'Bradenton', 'Pompano Beach', 'Naples',
  ],
  OK: [
    'Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton',
    'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater',
    'Muskogee', 'Bartlesville', 'Owasso', 'Ardmore', 'Shawnee',
    'Yukon', 'Sapulpa', 'Bixby', 'Jenks', 'Claremore',
  ],
  PA: [
    'Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading',
    'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona',
    'York', 'Wilkes-Barre', 'State College', 'Easton', 'Lebanon',
    'Pottsville', 'Hazleton', 'Chester', 'Norristown', 'Monroeville',
  ],
};

interface PlaceResult {
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  place_id: string;
}

interface TextSearchResponse {
  status: string;
  results: PlaceResult[];
  error_message?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse "123 Main St, City, ST 12345, USA" → { address, city, state, zip }
function parseGoogleAddress(formatted: string): {
  address: string;
  city: string;
  state: string;
  zip: string;
} | null {
  const clean = formatted.replace(/,?\s*(USA|United States)\s*$/, '').trim();
  const parts = clean.split(', ');
  if (parts.length < 3) return null;

  const stateZipPart = parts[parts.length - 1];
  const match = stateZipPart.match(/^([A-Z]{2})\s+(\d{5})/);
  if (!match) return null;

  return {
    address: parts.slice(0, parts.length - 2).join(', '),
    city: parts[parts.length - 2],
    state: match[1],
    zip: match[2],
  };
}

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  await sleep(200); // 5 req/sec — well under 600/min limit

  const params = new URLSearchParams({ query, type: 'store', key: API_KEY! });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${TEXT_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': '420nearme-scraper/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as TextSearchResponse;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(`[Google] Status ${data.status}: ${data.error_message ?? ''}`);
      return [];
    }
    return data.results ?? [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Google] Failed "${query}": ${msg}`);
    return [];
  }
}

export async function scrapeGooglePlaces(): Promise<ScrapedDispensary[]> {
  if (!API_KEY) {
    console.warn('[Google] GOOGLE_PLACES_API_KEY not set — skipping');
    return [];
  }

  const totalCities = Object.values(COVERAGE).reduce((s, c) => s + c.length, 0);
  console.log(`[Google] Scraping Places API for 16 states (${totalCities} city queries)...`);

  const dispensaries: ScrapedDispensary[] = [];
  const seenPlaceIds = new Set<string>();

  for (const [stateCode, cities] of Object.entries(COVERAGE)) {
    let stateCount = 0;

    for (const city of cities) {
      const results = await searchPlaces(`cannabis dispensary in ${city}, ${stateCode}`);

      for (const place of results) {
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        if (place.business_status === 'CLOSED_PERMANENTLY') continue;

        const parsed = parseGoogleAddress(place.formatted_address);
        if (!parsed) continue;

        // Discard cross-border results (e.g. El Paso TX when searching Sunland Park NM)
        if (parsed.state !== stateCode) continue;

        dispensaries.push({
          name: place.name,
          address: parsed.address,
          city: parsed.city,
          state: parsed.state,
          zip: parsed.zip,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          source: 'google',
        });
        stateCount++;
      }
    }

    console.log(`[Google] ${stateCode}: ${stateCount} dispensaries`);
  }

  console.log(`[Google] Total: ${dispensaries.length} dispensaries across 16 states`);
  return dispensaries;
}
