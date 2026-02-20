/**
 * Design tokens — colors, spacing, typography, border radii.
 * Dark theme by default; earthy green cannabis palette.
 */

export const Colors = {
  // Background hierarchy
  background: '#0f0f1a',
  surface: '#1a1a2e',
  card: '#16213e',
  cardBorder: '#0f3460',

  // Brand
  primary: '#4caf50',       // Cannabis green
  primaryDark: '#388e3c',
  primaryLight: '#81c784',

  // Text
  text: '#e8eaf6',
  textSecondary: '#9fa8da',
  textMuted: '#5c6bc0',
  textOnPrimary: '#ffffff',

  // Status — legality badges
  recreational: '#4caf50',  // Green
  medical: '#2196f3',        // Blue
  decriminalized: '#ff9800', // Orange
  illegal: '#f44336',        // Red

  // UI states
  error: '#ef5350',
  errorBackground: '#1c0000',
  warning: '#ffc107',
  success: '#66bb6a',

  // Tab bar
  tabActive: '#4caf50',
  tabInactive: '#546e7a',
  tabBackground: '#1a1a2e',

  // Misc
  divider: '#1e2a3a',
  overlay: 'rgba(0, 0, 0, 0.7)',
  inputBackground: '#1e2a3a',
  inputBorder: '#2a3a4a',
  placeholder: '#546e7a',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
};
