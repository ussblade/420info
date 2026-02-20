/**
 * Hook for the text-search flow.
 * Manages the Nominatim place search + dispensary lookup.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Dispensary, NominatimPlace } from '../types';
import { searchPlaces } from '../services/nominatimApi';
import { SEARCH_DEBOUNCE_MS } from '../constants/config';
import { useDispensaries } from './useDispensaries';

interface UseSearchDispensariesReturn {
  // Search input state
  query: string;
  setQuery: (q: string) => void;

  // Place suggestions from Nominatim
  suggestions: NominatimPlace[];
  suggestionsLoading: boolean;

  // Selected place (drives dispensary lookup)
  selectedPlace: NominatimPlace | null;
  selectPlace: (place: NominatimPlace) => void;
  clearSearch: () => void;

  // Dispensary results
  dispensaries: Dispensary[];
  dispensariesLoading: boolean;
  dispensariesError: string | null;
  refresh: () => void;
}

export function useSearchDispensaries(): UseSearchDispensariesReturn {
  const [query, setQueryRaw] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NominatimPlace | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feed selected place coordinates into the dispensary hook
  const {
    dispensaries,
    loading: dispensariesLoading,
    error: dispensariesError,
    refresh,
  } = useDispensaries(
    selectedPlace?.latitude ?? null,
    selectedPlace?.longitude ?? null
  );

  // Debounced search
  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      const results = await searchPlaces(q);
      setSuggestions(results);
      setSuggestionsLoading(false);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const selectPlace = useCallback((place: NominatimPlace) => {
    setSelectedPlace(place);
    setQueryRaw(place.displayName.split(',')[0]); // Show just the place name
    setSuggestions([]);
  }, []);

  const clearSearch = useCallback(() => {
    setQueryRaw('');
    setSuggestions([]);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    suggestionsLoading,
    selectedPlace,
    selectPlace,
    clearSearch,
    dispensaries,
    dispensariesLoading,
    dispensariesError,
    refresh,
  };
}
