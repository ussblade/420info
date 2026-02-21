import React, { createContext, useContext, useState } from 'react';

export type ThemeId = 'dispensary' | 'underground' | 'nature' | 'neon' | 'retro';

export interface AppTheme {
  id: ThemeId;
  name: string;
  emoji: string;

  // Backgrounds
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceAlt: string;

  // Text
  text: string;
  textSub: string;
  textMuted: string;
  textInverse: string;

  // Brand
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;

  // Borders
  border: string;
  borderStrong: string;

  // Legality map colors
  mapRecreational: string;
  mapMedical: string;
  mapDecriminalized: string;
  mapIllegal: string;
  mapText: string;

  // Tab bar
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;

  // Cards
  cardRadius: number;
  cardBorderWidth: number;
  cardBorderColor: string;
  cardShadowColor: string;
  cardShadowOpacity: number;

  // Inputs
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  inputRadius: number;

  // Header
  headerBg: string;
  headerText: string;
  headerBorderColor: string;

  // Pills / chips
  pillBg: string;
  pillText: string;
  pillActiveBg: string;
  pillActiveText: string;

  // Fonts (system fonts — swap for expo-google-fonts as noted below)
  fontDisplay: string;
  fontBody: string;
  fontMono: string;

  statusBar: 'light' | 'dark';
}

// ─── Theme 1: Dispensary ─────────────────────────────────────────────────────
// High-end cannabis boutique. Cream + forest green + warm gold.
// Install: @expo-google-fonts/playfair-display + @expo-google-fonts/jost
const dispensary: AppTheme = {
  id: 'dispensary', name: 'Dispensary', emoji: '🏪',
  bg: '#F7F3EC', bgAlt: '#EDE8DF', surface: '#FFFFFF', surfaceAlt: '#F0EBE2',
  text: '#1A2E1A', textSub: '#3D5C3D', textMuted: '#8A9E8A', textInverse: '#F7F3EC',
  primary: '#1A3A2A', primaryText: '#F7F3EC', accent: '#C4A55A', accentText: '#1A2E1A',
  border: '#DDD5C5', borderStrong: '#1A3A2A',
  mapRecreational: '#2D7A4F', mapMedical: '#2B5BA8', mapDecriminalized: '#B8962A', mapIllegal: '#B84040', mapText: '#FFFFFF',
  tabBg: '#1A3A2A', tabBorder: '#0F2218', tabActive: '#C4A55A', tabInactive: '#5A7A5A',
  cardRadius: 14, cardBorderWidth: 0, cardBorderColor: 'transparent', cardShadowColor: '#000', cardShadowOpacity: 0.08,
  inputBg: '#FFFFFF', inputBorder: '#DDD5C5', inputText: '#1A2E1A', inputPlaceholder: '#9BAA8B', inputRadius: 10,
  headerBg: '#1A3A2A', headerText: '#F7F3EC', headerBorderColor: 'transparent',
  pillBg: '#EDE8DF', pillText: '#3D5C3D', pillActiveBg: '#1A3A2A', pillActiveText: '#F7F3EC',
  fontDisplay: 'Georgia', fontBody: 'System', fontMono: 'Courier New',
  statusBar: 'light',
};

// ─── Theme 2: Underground ────────────────────────────────────────────────────
// Bootleg, street culture, concrete and red tape. Brutalist grid.
// Install: @expo-google-fonts/bebas-neue + @expo-google-fonts/space-mono
const underground: AppTheme = {
  id: 'underground', name: 'Underground', emoji: '🔥',
  bg: '#0A0A0A', bgAlt: '#111111', surface: '#181818', surfaceAlt: '#202020',
  text: '#EEEEEE', textSub: '#AAAAAA', textMuted: '#555555', textInverse: '#0A0A0A',
  primary: '#FF2D2D', primaryText: '#FFFFFF', accent: '#FFD700', accentText: '#000000',
  border: '#252525', borderStrong: '#FF2D2D',
  mapRecreational: '#00AA44', mapMedical: '#3366FF', mapDecriminalized: '#FFD700', mapIllegal: '#CC2222', mapText: '#FFFFFF',
  tabBg: '#0A0A0A', tabBorder: '#FF2D2D', tabActive: '#FF2D2D', tabInactive: '#3A3A3A',
  cardRadius: 0, cardBorderWidth: 1, cardBorderColor: '#252525', cardShadowColor: 'transparent', cardShadowOpacity: 0,
  inputBg: '#181818', inputBorder: '#333333', inputText: '#EEEEEE', inputPlaceholder: '#444444', inputRadius: 0,
  headerBg: '#0A0A0A', headerText: '#FF2D2D', headerBorderColor: '#FF2D2D',
  pillBg: '#181818', pillText: '#AAAAAA', pillActiveBg: '#FF2D2D', pillActiveText: '#FFFFFF',
  fontDisplay: 'Courier New', fontBody: 'Courier New', fontMono: 'Courier New',
  statusBar: 'light',
};

// ─── Theme 3: Nature ─────────────────────────────────────────────────────────
// Botanical apothecary. Warm terracotta + sage + cream parchment.
// Install: @expo-google-fonts/cormorant-garamond + @expo-google-fonts/nunito
const nature: AppTheme = {
  id: 'nature', name: 'Nature', emoji: '🌿',
  bg: '#F3EDE0', bgAlt: '#E9E0CF', surface: '#FCF8F2', surfaceAlt: '#EDE3D5',
  text: '#3A2E1E', textSub: '#5C4A30', textMuted: '#9A8068', textInverse: '#FCF8F2',
  primary: '#7D9B5E', primaryText: '#FFFFFF', accent: '#D4845A', accentText: '#FFFFFF',
  border: '#D8CCBA', borderStrong: '#7D9B5E',
  mapRecreational: '#6A9B4A', mapMedical: '#5A7AB8', mapDecriminalized: '#CCA844', mapIllegal: '#B85A4A', mapText: '#FFFFFF',
  tabBg: '#3A2E1E', tabBorder: '#261E12', tabActive: '#D4845A', tabInactive: '#7A6050',
  cardRadius: 22, cardBorderWidth: 0, cardBorderColor: 'transparent', cardShadowColor: '#3A2E1E', cardShadowOpacity: 0.1,
  inputBg: '#FCF8F2', inputBorder: '#D8CCBA', inputText: '#3A2E1E', inputPlaceholder: '#B0A090', inputRadius: 22,
  headerBg: '#F3EDE0', headerText: '#3A2E1E', headerBorderColor: '#D8CCBA',
  pillBg: '#EDE3D5', pillText: '#5C4A30', pillActiveBg: '#7D9B5E', pillActiveText: '#FFFFFF',
  fontDisplay: 'Georgia', fontBody: 'System', fontMono: 'Courier New',
  statusBar: 'dark',
};

// ─── Theme 4: Neon ───────────────────────────────────────────────────────────
// Blacklight rave. Deep space black, electric green, hot pink.
// Install: @expo-google-fonts/orbitron + @expo-google-fonts/rajdhani
const neon: AppTheme = {
  id: 'neon', name: 'Neon', emoji: '⚡',
  bg: '#050510', bgAlt: '#080820', surface: '#0C0C28', surfaceAlt: '#10103A',
  text: '#D0D0FF', textSub: '#9090CC', textMuted: '#404080', textInverse: '#050510',
  primary: '#00FF88', primaryText: '#050510', accent: '#FF00CC', accentText: '#FFFFFF',
  border: '#151545', borderStrong: '#00FF88',
  mapRecreational: '#00CC66', mapMedical: '#0088FF', mapDecriminalized: '#FFCC00', mapIllegal: '#FF3355', mapText: '#FFFFFF',
  tabBg: '#050510', tabBorder: '#00FF88', tabActive: '#00FF88', tabInactive: '#252550',
  cardRadius: 6, cardBorderWidth: 1, cardBorderColor: '#151545', cardShadowColor: '#00FF88', cardShadowOpacity: 0.15,
  inputBg: '#0C0C28', inputBorder: '#151545', inputText: '#D0D0FF', inputPlaceholder: '#303060', inputRadius: 4,
  headerBg: '#050510', headerText: '#00FF88', headerBorderColor: '#00FF88',
  pillBg: '#0C0C28', pillText: '#9090CC', pillActiveBg: '#00FF88', pillActiveText: '#050510',
  fontDisplay: 'Courier New', fontBody: 'System', fontMono: 'Courier New',
  statusBar: 'light',
};

// ─── Theme 5: Retro ──────────────────────────────────────────────────────────
// 1970s head shop. Amber, saddle brown, olive, offset-print feel.
// Install: @expo-google-fonts/righteous + @expo-google-fonts/courier-prime
const retro: AppTheme = {
  id: 'retro', name: 'Retro', emoji: '🕺',
  bg: '#F0A020', bgAlt: '#E09018', surface: '#FFB830', surfaceAlt: '#F5A820',
  text: '#220E02', textSub: '#4A2010', textMuted: '#8B5A2A', textInverse: '#F0A020',
  primary: '#220E02', primaryText: '#F0A020', accent: '#6B8E23', accentText: '#FFFFFF',
  border: '#BB7810', borderStrong: '#220E02',
  mapRecreational: '#4A8A30', mapMedical: '#3A5A9A', mapDecriminalized: '#AA8000', mapIllegal: '#8A2020', mapText: '#FFFFFF',
  tabBg: '#220E02', tabBorder: '#110801', tabActive: '#F0A020', tabInactive: '#5A3010',
  cardRadius: 6, cardBorderWidth: 3, cardBorderColor: '#220E02', cardShadowColor: '#220E02', cardShadowOpacity: 0.25,
  inputBg: '#FFB830', inputBorder: '#220E02', inputText: '#220E02', inputPlaceholder: '#8B5A2A', inputRadius: 4,
  headerBg: '#220E02', headerText: '#F0A020', headerBorderColor: 'transparent',
  pillBg: '#F5A820', pillText: '#4A2010', pillActiveBg: '#220E02', pillActiveText: '#F0A020',
  fontDisplay: 'Georgia', fontBody: 'System', fontMono: 'Courier New',
  statusBar: 'light',
};

export const THEMES: Record<ThemeId, AppTheme> = { dispensary, underground, nature, neon, retro };
export const THEME_LIST: AppTheme[] = [dispensary, underground, nature, neon, retro];

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeCtx { theme: AppTheme; setThemeId: (id: ThemeId) => void }
const ThemeContext = createContext<ThemeCtx>({ theme: dispensary, setThemeId: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('dispensary');
  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
