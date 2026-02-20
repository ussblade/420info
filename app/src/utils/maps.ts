import { Platform, Linking } from 'react-native';

/**
 * Open native maps app with a destination pin.
 * Android: geo: URI → Google Maps
 * iOS: maps:// URI → Apple Maps, falls back to Google Maps web
 */
export function openDirections(lat: number, lon: number, name: string): void {
  const label = encodeURIComponent(name);
  const url =
    Platform.OS === 'ios'
      ? `maps://maps.apple.com/?daddr=${lat},${lon}&q=${label}`
      : `geo:${lat},${lon}?q=${lat},${lon}(${label})`;

  Linking.openURL(url).catch(() => {
    // Fallback to Google Maps web if native maps not available
    Linking.openURL(
      `https://maps.google.com/maps?daddr=${lat},${lon}&q=${label}`
    );
  });
}

/** Open phone dialer with a given number. */
export function callPhone(phone: string): void {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  Linking.openURL(`tel:${cleaned}`).catch(() => {
    console.warn('Cannot open phone dialer:', phone);
  });
}

/** Open a URL in the device browser. */
export function openWebsite(url: string): void {
  const href = url.startsWith('http') ? url : `https://${url}`;
  Linking.openURL(href).catch(() => {
    console.warn('Cannot open URL:', href);
  });
}
