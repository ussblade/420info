import { useState, useCallback } from 'react';
import type { Coordinates } from '../types';
import {
  getCurrentLocation,
  LOCATION_ERROR_MESSAGES,
  type LocationError,
} from '../services/locationService';

interface UseLocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  errorCode: LocationError | null;
}

interface UseLocationReturn extends UseLocationState {
  requestLocation: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<UseLocationState>({
    coordinates: null,
    loading: false,
    error: null,
    errorCode: null,
  });

  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, errorCode: null }));

    const result = await getCurrentLocation();

    if (result.error) {
      setState({
        coordinates: null,
        loading: false,
        error: LOCATION_ERROR_MESSAGES[result.error],
        errorCode: result.error,
      });
    } else {
      setState({
        coordinates: result.coordinates,
        loading: false,
        error: null,
        errorCode: null,
      });
    }
  }, []);

  return { ...state, requestLocation };
}
