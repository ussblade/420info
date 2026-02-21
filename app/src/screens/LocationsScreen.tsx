/**
 * LocationsScreen — Find nearby dispensaries by GPS or city/zip search.
 * Layout and colors driven entirely by the active theme.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ScrollView, Modal, ActivityIndicator,
  SafeAreaView, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_LIST, type AppTheme } from '../themes';
import { useLocation } from '../hooks/useLocation';
import { geocodeQuery } from '../services/nominatimApi';
import { fetchScrapedDispensaries } from '../services/scrapedDataService';
import { queryOverpass } from '../services/overpassApi';
import { mergeDispensaries } from '../services/mergeService';
import { calculateDistanceMiles } from '../utils/distance';
import { openDirections } from '../utils/maps';
import type { Dispensary } from '../types';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250, 500];
const PAGE_SIZE = 10;

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, count, color }: { rating: number; count?: number; color: string }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {stars.map(s => (
        <Text key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? '#FFB800' : color + '44' }}>
          ★
        </Text>
      ))}
      <Text style={{ fontSize: 11, color, marginLeft: 2 }}>
        {rating.toFixed(1)}{count ? ` (${count.toLocaleString()})` : ''}
      </Text>
    </View>
  );
}

// ─── Dispensary Card ─────────────────────────────────────────────────────────
function DispensaryCard({ item, index, theme }: { item: Dispensary; index: number; theme: AppTheme }) {
  const s = useMemo(() => cardStyles(theme), [theme]);

  const sourceBadge = item.source === 'google' ? 'G' : item.source === 'osm' ? '◎' : '✓';
  const sourceColor = item.source === 'google' ? '#4285F4' : item.source === 'osm' ? theme.accent : theme.primary;

  return (
    <View style={s.card}>
      {/* Index bubble — theme-styled */}
      <View style={s.indexBubble}>
        <Text style={s.indexText}>{index + 1}</Text>
      </View>

      <View style={s.cardBody}>
        {/* Name row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
          <Text style={[s.sourceBadge, { color: sourceColor }]}>{sourceBadge}</Text>
        </View>

        {/* Rating */}
        {item.rating != null && (
          <View style={{ marginTop: 4 }}>
            <StarRating rating={item.rating} count={item.reviewCount} color={theme.textMuted} />
          </View>
        )}

        {/* Distance + city */}
        <Text style={s.meta}>
          {item.distanceMiles != null ? `${item.distanceMiles.toFixed(1)} mi  ·  ` : ''}
          {item.city}{item.state ? `, ${item.state}` : ''}
        </Text>
        <Text style={s.address} numberOfLines={1}>{item.address}</Text>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => openDirections(item.latitude, item.longitude, item.name)}
          >
            <Ionicons name="navigate" size={13} color={theme.primaryText} />
            <Text style={s.actionText}>Directions</Text>
          </TouchableOpacity>

          {item.phone && (
            <TouchableOpacity style={[s.actionBtn, s.actionBtnSecondary]}>
              <Ionicons name="call" size={13} color={theme.primary} />
              <Text style={[s.actionText, { color: theme.primary }]}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function cardStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderRadius: t.cardRadius,
      borderWidth: t.cardBorderWidth,
      borderColor: t.cardBorderColor,
      marginHorizontal: 16,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: t.cardShadowColor,
      shadowOffset: { width: t.id === 'retro' ? 4 : 0, height: t.id === 'retro' ? 4 : 2 },
      shadowOpacity: t.cardShadowOpacity,
      shadowRadius: t.id === 'retro' ? 0 : 8,
      elevation: t.id === 'underground' ? 0 : 3,
    },
    indexBubble: {
      width: 36,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    indexText: {
      color: t.primaryText,
      fontFamily: t.fontMono,
      fontSize: t.id === 'underground' ? 16 : 14,
      fontWeight: '700',
    },
    cardBody: { flex: 1, padding: 12 },
    name: {
      fontFamily: t.fontDisplay,
      fontSize: t.id === 'underground' ? 16 : 15,
      fontWeight: '700',
      color: t.text,
      flex: 1,
      marginRight: 8,
      letterSpacing: t.id === 'underground' ? 0.5 : 0,
    },
    sourceBadge: {
      fontSize: 11,
      fontFamily: t.fontMono,
      fontWeight: '700',
      opacity: 0.7,
    },
    meta: {
      fontFamily: t.fontBody,
      fontSize: 12,
      color: t.textMuted,
      marginTop: 4,
    },
    address: {
      fontFamily: t.fontBody,
      fontSize: 12,
      color: t.textSub,
      marginTop: 2,
    },
    actions: { flexDirection: 'row', marginTop: 10, gap: 8 },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.primary,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: t.cardRadius > 10 ? 20 : t.cardRadius,
      gap: 4,
    },
    actionBtnSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: t.border,
    },
    actionText: {
      color: t.primaryText,
      fontSize: 11,
      fontWeight: '600',
      fontFamily: t.fontBody,
    },
  });
}

// ─── Theme Picker Modal ───────────────────────────────────────────────────────
function ThemePickerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme, setThemeId } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.themeSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.themeSheetTitle, { color: theme.text, fontFamily: theme.fontDisplay }]}>
            Choose Theme
          </Text>
          {THEME_LIST.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.themeRow,
                { borderColor: t.id === theme.id ? theme.primary : theme.border },
                t.id === theme.id && { backgroundColor: theme.bgAlt },
              ]}
              onPress={() => { setThemeId(t.id); onClose(); }}
            >
              <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
              <Text style={[styles.themeRowText, { color: theme.text, fontFamily: theme.fontBody }]}>
                {t.name}
              </Text>
              {t.id === theme.id && (
                <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function LocationsScreen() {
  const { theme } = useTheme();
  const { location, loading: locationLoading, error: locationError, refresh: refreshLocation } = useLocation();

  const [searchMode, setSearchMode] = useState<'gps' | 'text'>('gps');
  const [searchText, setSearchText] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasSearched, setHasSearched] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);

  const visibleDispensaries = dispensaries.slice(0, visibleCount);
  const hasMore = visibleCount < dispensaries.length;

  const runSearch = useCallback(async () => {
    setError(null);
    setLoading(true);
    setHasSearched(true);
    setVisibleCount(PAGE_SIZE);

    try {
      let lat: number, lon: number;

      if (searchMode === 'gps') {
        if (!location) {
          setError('GPS location unavailable. Enable location permissions.');
          setLoading(false);
          return;
        }
        lat = location.latitude;
        lon = location.longitude;
      } else {
        if (!searchText.trim()) {
          setError('Enter a city, state, or zip code.');
          setLoading(false);
          return;
        }
        const coords = await geocodeQuery(searchText.trim());
        if (!coords) {
          setError(`Could not find "${searchText}". Try a city + state like "Denver, CO".`);
          setLoading(false);
          return;
        }
        lat = coords.latitude;
        lon = coords.longitude;
      }

      const radiusMeters = radiusMiles * 1609.34;
      const [scraped, osm] = await Promise.all([
        fetchScrapedDispensaries(),
        queryOverpass(lat, lon, radiusMeters),
      ]);

      const merged = mergeDispensaries(scraped, osm, lat, lon)
        .filter(d => {
          const dist = calculateDistanceMiles(lat, lon, d.latitude, d.longitude);
          return dist <= radiusMiles;
        })
        .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));

      setDispensaries(merged);
    } catch (e) {
      setError('Search failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [searchMode, searchText, radiusMiles, location]);

  // ── Derived styles ─────────────────────────────────────────────────────────
  const s = useMemo(() => screenStyles(theme), [theme]);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>
            {theme.id === 'underground' ? 'LOCATIONS' :
             theme.id === 'neon' ? '[ LOCATIONS ]' :
             theme.id === 'retro' ? '✦ LOCATIONS ✦' :
             theme.id === 'nature' ? 'Find Your Green' :
             'Locations'}
          </Text>
          <TouchableOpacity
            style={s.themeBtn}
            onPress={() => setThemePickerVisible(true)}
          >
            <Text style={{ fontSize: 18 }}>{theme.emoji}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Search Mode Toggle ── */}
          <View style={s.toggleRow}>
            {(['gps', 'text'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[s.toggleBtn, searchMode === mode && s.toggleBtnActive]}
                onPress={() => setSearchMode(mode)}
              >
                <Ionicons
                  name={mode === 'gps' ? 'locate' : 'search'}
                  size={14}
                  color={searchMode === mode ? theme.pillActiveText : theme.pillText}
                />
                <Text style={[s.toggleText, searchMode === mode && s.toggleTextActive]}>
                  {mode === 'gps' ? 'Use My Location' : 'City / Zip'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Text Input (text mode only) ── */}
          {searchMode === 'text' && (
            <View style={s.inputRow}>
              <Ionicons name="search" size={16} color={theme.inputPlaceholder} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="Denver, CO · 80203 · New York"
                placeholderTextColor={theme.inputPlaceholder}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={runSearch}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={16} color={theme.inputPlaceholder} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Radius Selector ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              {theme.id === 'underground' ? 'RADIUS' : theme.id === 'neon' ? '// RADIUS' : 'Search Radius'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {RADIUS_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[s.radiusPill, r === radiusMiles && s.radiusPillActive]}
                  onPress={() => setRadiusMiles(r)}
                >
                  <Text style={[s.radiusText, r === radiusMiles && s.radiusTextActive]}>
                    {r} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Search Button ── */}
          <TouchableOpacity
            style={[s.searchBtn, loading && s.searchBtnDisabled]}
            onPress={runSearch}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.primaryText} />
            ) : (
              <>
                <Ionicons name="leaf" size={16} color={theme.primaryText} />
                <Text style={s.searchBtnText}>
                  {theme.id === 'underground' ? 'FIND IT' :
                   theme.id === 'neon' ? 'SCAN AREA' :
                   theme.id === 'retro' ? 'FIND THE STASH' :
                   theme.id === 'nature' ? 'Find Nearby' :
                   'Search'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── GPS Status (gps mode) ── */}
          {searchMode === 'gps' && locationLoading && (
            <Text style={s.statusNote}>Getting your location…</Text>
          )}
          {searchMode === 'gps' && locationError && (
            <Text style={[s.statusNote, { color: '#FF5555' }]}>
              Location error: {locationError}
            </Text>
          )}

          {/* ── Error ── */}
          {error && (
            <View style={s.errorBanner}>
              <Ionicons name="warning" size={14} color="#FF5555" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Results header ── */}
          {hasSearched && !loading && (
            <View style={s.resultsHeader}>
              <Text style={s.resultsCount}>
                {dispensaries.length === 0
                  ? 'No dispensaries found'
                  : `${dispensaries.length} dispensar${dispensaries.length === 1 ? 'y' : 'ies'} within ${radiusMiles} mi`}
              </Text>
              {dispensaries.length > 0 && (
                <Text style={s.resultsSub}>
                  Showing {Math.min(visibleCount, dispensaries.length)} of {dispensaries.length}
                </Text>
              )}
            </View>
          )}

          {/* ── Results List ── */}
          {visibleDispensaries.map((item, index) => (
            <DispensaryCard key={item.id} item={item} index={index} theme={theme} />
          ))}

          {/* ── Pagination ── */}
          {hasMore && (
            <View style={s.paginationRow}>
              <TouchableOpacity
                style={s.paginationBtn}
                onPress={() => setVisibleCount(v => v + PAGE_SIZE)}
              >
                <Text style={s.paginationText}>
                  Show {Math.min(PAGE_SIZE, dispensaries.length - visibleCount)} More
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.paginationBtn, s.paginationBtnAll]}
                onPress={() => setVisibleCount(dispensaries.length)}
              >
                <Text style={[s.paginationText, { color: theme.accent }]}>Show All</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hasSearched && (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>
                {theme.id === 'underground' ? '🔍' :
                 theme.id === 'neon' ? '⚡' :
                 theme.id === 'retro' ? '☮' : '🌿'}
              </Text>
              <Text style={s.emptyText}>
                {theme.id === 'underground' ? 'Hit the button. Find the green.' :
                 theme.id === 'neon' ? 'Activate search to find dispensaries' :
                 theme.id === 'retro' ? 'Far out, man. Search to begin your journey.' :
                 theme.id === 'nature' ? 'Connect with nature\'s dispensaries nearby.' :
                 'Search to find dispensaries near you.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <ThemePickerModal visible={themePickerVisible} onClose={() => setThemePickerVisible(false)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function screenStyles(t: AppTheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { flex: 1 },
    header: {
      backgroundColor: t.headerBg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: t.id === 'underground' || t.id === 'neon' ? 1 : 0,
      borderBottomColor: t.headerBorderColor,
    },
    headerTitle: {
      fontFamily: t.fontDisplay,
      fontSize: t.id === 'underground' ? 22 : t.id === 'neon' ? 18 : 20,
      fontWeight: '700',
      color: t.headerText,
      letterSpacing: t.id === 'underground' ? 3 : t.id === 'neon' ? 2 : 0,
    },
    themeBtn: {
      width: 38, height: 38,
      borderRadius: t.id === 'underground' ? 0 : 19,
      borderWidth: t.id === 'underground' ? 1 : 0,
      borderColor: t.id === 'underground' ? '#333' : 'transparent',
      backgroundColor: t.id === 'dispensary' ? 'rgba(196,165,90,0.2)' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: t.bgAlt,
      borderRadius: t.cardRadius,
      borderWidth: t.cardBorderWidth,
      borderColor: t.border,
      overflow: 'hidden',
    },
    toggleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 6,
    },
    toggleBtnActive: { backgroundColor: t.pillActiveBg },
    toggleText: {
      fontFamily: t.fontBody,
      fontSize: 13,
      fontWeight: '600',
      color: t.pillText,
      letterSpacing: t.id === 'underground' ? 0.5 : 0,
    },
    toggleTextActive: { color: t.pillActiveText },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.inputBg,
      borderRadius: t.inputRadius,
      borderWidth: 1,
      borderColor: t.inputBorder,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    input: {
      flex: 1,
      fontFamily: t.fontBody,
      fontSize: 14,
      color: t.inputText,
    },
    section: { paddingHorizontal: 16, marginBottom: 8 },
    sectionLabel: {
      fontFamily: t.fontMono,
      fontSize: 11,
      fontWeight: '700',
      color: t.textMuted,
      letterSpacing: t.id === 'underground' || t.id === 'neon' ? 2 : 0.5,
      textTransform: 'uppercase',
    },
    radiusPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: t.inputRadius,
      borderWidth: 1,
      borderColor: t.border,
      marginRight: 8,
      backgroundColor: t.pillBg,
    },
    radiusPillActive: {
      backgroundColor: t.pillActiveBg,
      borderColor: t.pillActiveBg,
    },
    radiusText: {
      fontFamily: t.fontMono,
      fontSize: 13,
      color: t.pillText,
      fontWeight: '600',
    },
    radiusTextActive: { color: t.pillActiveText },
    searchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primary,
      marginHorizontal: 16,
      marginVertical: 12,
      paddingVertical: 14,
      borderRadius: t.cardRadius,
      gap: 8,
      borderWidth: t.id === 'retro' ? 3 : 0,
      borderColor: t.id === 'retro' ? '#110801' : 'transparent',
      shadowColor: t.id === 'retro' ? '#110801' : t.primary,
      shadowOffset: { width: t.id === 'retro' ? 4 : 0, height: t.id === 'retro' ? 4 : 0 },
      shadowOpacity: t.id === 'retro' ? 1 : 0,
      shadowRadius: 0,
      elevation: t.id === 'retro' ? 3 : 0,
    },
    searchBtnDisabled: { opacity: 0.6 },
    searchBtnText: {
      fontFamily: t.fontDisplay,
      fontSize: 15,
      fontWeight: '700',
      color: t.primaryText,
      letterSpacing: t.id === 'underground' ? 2 : 0.5,
    },
    statusNote: {
      fontFamily: t.fontBody,
      fontSize: 12,
      color: t.textMuted,
      textAlign: 'center',
      marginBottom: 8,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF555520',
      borderRadius: t.cardRadius,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: '#FF555540',
    },
    errorText: {
      fontFamily: t.fontBody,
      fontSize: 13,
      color: '#FF5555',
      flex: 1,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      paddingHorizontal: 16,
      marginBottom: 12,
      paddingTop: 4,
    },
    resultsCount: {
      fontFamily: t.fontDisplay,
      fontSize: 14,
      fontWeight: '700',
      color: t.text,
      letterSpacing: t.id === 'underground' ? 1 : 0,
    },
    resultsSub: {
      fontFamily: t.fontBody,
      fontSize: 12,
      color: t.textMuted,
    },
    paginationRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 4,
      marginBottom: 8,
    },
    paginationBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: t.cardRadius,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      backgroundColor: t.surface,
    },
    paginationBtnAll: { borderColor: t.accent },
    paginationText: {
      fontFamily: t.fontBody,
      fontSize: 13,
      fontWeight: '600',
      color: t.text,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 48,
      paddingHorizontal: 32,
    },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyText: {
      fontFamily: t.fontBody,
      fontSize: 15,
      color: t.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    themeSheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      padding: 24,
      paddingBottom: 40,
    },
    themeSheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 8,
      gap: 12,
    },
    themeRowText: { flex: 1, fontSize: 15, fontWeight: '600' },
  });
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  themeSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 24, paddingBottom: 40,
  },
  themeSheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8, gap: 12,
  },
  themeRowText: { flex: 1, fontSize: 15, fontWeight: '600' },
});
