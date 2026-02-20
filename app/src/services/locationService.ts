/**
 * GPS location service using expo-location.
 * Handles permission requests and returns current coordinates.
 */

import * as Location from 'expo-location';
import type { Coordinates } from '../types';

export type LocationError =
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'unknown';

export interface LocationResult {
  coordinates: Coordinates | null;
  error: LocationError | null;
}

/**
 * Request location permission and get current GPS coordinates.
 * Returns a discriminated union: either coordinates or an error code.
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    // Request foreground permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('[Location] Permission denied');
      return { coordinates: null, error: 'permission_denied' };
    }

    // Get current position with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
    });

    return {
      coordinates: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Location] Failed to get location:', message);

    if (message.includes('denied') || message.includes('permission')) {
      return { coordinates: null, error: 'permission_denied' };
    }
    if (message.includes('timeout')) {
      return { coordinates: null, error: 'timeout' };
    }
    if (message.includes('unavailable')) {
      return { coordinates: null, error: 'unavailable' };
    }
    return { coordinates: null, error: 'unknown' };
  }
}

/** Check current permission status without prompting. */
export async function checkLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

/** Human-readable error messages for each LocationError code. */
export const LOCATION_ERROR_MESSAGES: Record<LocationError, string> = {
  permission_denied:
    'Location access denied. Please enable it in Settings to use this feature.',
  unavailable:
    'Location services are unavailable on this device.',
  timeout:
    'Location request timed out. Check that GPS is enabled.',
  unknown:
    'Could not get your location. Please try again.',
};
