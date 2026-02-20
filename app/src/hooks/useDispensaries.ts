/**
 * Main orchestrator hook.
 * Fetches scraped data (CDN cache) + live OSM data, merges, and returns sorted list.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Dispensary } from '../types';
import { fetchScrapedDispensaries } from '../services/scrapedDataService';
import { queryOverpass } from '../services/overpassApi';
import { mergeDispensaries } from '../services/mergeService';
import { SEARCH_RADIUS_METERS } from '../constants/config';

const RADIUS_MILES = SEARCH_RADIUS_METERS / 1609.34;

interface UseDispensariesState {
  dispensaries: Dispensary[];
  loading: boolean;
  error: string | null;
  /** True if we have some data but the live refresh failed */
  stale: boolean;
}

interface UseDispensariesReturn extends UseDispensariesState {
  refresh: () => void;
}

export function useDispensaries(
  latitude: number | null,
  longitude: number | null
): UseDispensariesReturn {
  const [state, setState] = useState<UseDispensariesState>({
    dispensaries: [],
    loading: false,
    error: null,
    stale: false,
  });

  // Ref to hold the latest scraped data across re-fetches
  const scrapedRef = useRef<Dispensary[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (latitude === null || longitude === null) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Run scraped fetch and Overpass query in parallel
      const [scraped, osm] = await Promise.all([
        fetchScrapedDispensaries(),
        queryOverpass(latitude, longitude, SEARCH_RADIUS_METERS),
      ]);

      // Check if aborted
      if (abortRef.current?.signal.aborted) return;

      scrapedRef.current = scraped;
      const merged = mergeDispensaries(scraped, osm, latitude, longitude, RADIUS_MILES);

      setState({
        dispensaries: merged,
        loading: false,
        error: merged.length === 0 ? 'No dispensaries found in your area.' : null,
        stale: false,
      });
    } catch (err) {
      if (abortRef.current?.signal.aborted) return;

      console.warn('[useDispensaries] Load failed:', err);

      // Try to show something from scraped cache even if OSM failed
      if (scrapedRef.current.length > 0) {
        const fallback = mergeDispensaries(
          scrapedRef.current,
          [],
          latitude,
          longitude,
          RADIUS_MILES
        );
        setState({
          dispensaries: fallback,
          loading: false,
          error: null,
          stale: true,
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Could not load dispensaries. Check your connection and try again.',
          stale: false,
        }));
      }
    }
  }, [latitude, longitude]);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  return { ...state, refresh: load };
}
