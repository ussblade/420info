/**
 * Shared TypeScript interfaces for 420nearme.
 * Written first — all other files import from here.
 */

// ─── Dispensary ──────────────────────────────────────────────────────────────

export type DispensarySource = 'scraped' | 'osm' | 'google';

export interface Dispensary {
  /** Stable ID (state-slug-index for scraped, osm-<osmId> for OSM) */
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  licenseNumber?: string;
  /** Hours of operation — free-form string from OSM tags */
  openingHours?: string;
  /** Google star rating (1–5), present for 'google' source entries */
  rating?: number;
  /** Number of Google reviews */
  reviewCount?: number;
  source: DispensarySource;
  /** Computed after merge; miles from user location */
  distanceMiles?: number;
}

// ─── Scraped CDN response ─────────────────────────────────────────────────────

export interface ScrapedDataResponse {
  generatedAt: string;
  count: number;
  dispensaries: Dispensary[];
}

// ─── State Laws ───────────────────────────────────────────────────────────────

export type LegalityStatus =
  | 'recreational'
  | 'medical'
  | 'decriminalized'
  | 'illegal';

export interface StateLaw {
  stateCode: string;   // 'CA', 'CO', 'DC', etc.
  stateName: string;
  status: LegalityStatus;
  medicalLegal: boolean;
  recreationalLegal: boolean;
  /** Short plaintext notes about the current legal status */
  notes: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface NominatimPlace {
  placeId: number;
  displayName: string;
  latitude: number;
  longitude: number;
}
