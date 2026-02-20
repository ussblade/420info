/**
 * Display formatting helpers for dispensary data.
 */

/**
 * Format a phone number string for display.
 * Input: "3035551234" or "+13035551234" or "(303) 555-1234"
 * Output: "(303) 555-1234"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return phone; // Return as-is if unexpected format
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

/**
 * Format distance for display.
 * < 0.1 mi → "< 0.1 mi"
 * 0.1–9.9 → "1.2 mi"
 * ≥ 10 → "12 mi"
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/**
 * Format a one-line address: "123 Main St, Denver, CO 80202"
 */
export function formatAddress(
  address: string,
  city: string,
  state: string,
  zip?: string
): string {
  const parts = [address, city, `${state}${zip ? ` ${zip}` : ''}`].filter(Boolean);
  return parts.join(', ');
}

/**
 * Truncate a string to a max length, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}
