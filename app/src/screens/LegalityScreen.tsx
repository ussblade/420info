/**
 * LegalityScreen — Real SVG US map (Albers USA projection) + expandable state law details.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_LIST, type AppTheme } from '../themes';
import { STATE_LAWS } from '../data/stateLaws';
import { STATE_PATHS, STATE_CENTROIDS, US_MAP_VIEWBOX } from '../data/usStatePaths';
import type { StateLaw, LegalityStatus } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_PADDING = 8;
const MAP_W = SCREEN_WIDTH - MAP_PADDING * 2;
// ViewBox is "0 0 960 593" — maintain aspect ratio
const MAP_H = Math.round(MAP_W * (593 / 960));

function statusColor(status: LegalityStatus, theme: AppTheme): string {
  switch (status) {
    case 'recreational':   return theme.mapRecreational;
    case 'medical':        return theme.mapMedical;
    case 'decriminalized': return theme.mapDecriminalized;
    default:               return theme.mapIllegal;
  }
}

function statusLabel(status: LegalityStatus): string {
  switch (status) {
    case 'recreational':   return 'Recreational';
    case 'medical':        return 'Medical Only';
    case 'decriminalized': return 'Decriminalized';
    default:               return 'Illegal';
  }
}

// ─── Per-state detail data ─────────────────────────────────────────────────
const STATE_DETAIL: Record<string, { possession?: string; purchase?: string; homeGrow?: string }> = {
  AK: { possession: '1 oz in public; 4 oz at home', purchase: '1 oz per transaction', homeGrow: 'Up to 6 plants (3 mature) per adult' },
  AZ: { possession: '1 oz (5g concentrate)', purchase: '1 oz per day', homeGrow: 'Up to 6 plants per adult (12 max per household)' },
  CA: { possession: '1 oz flower; 8g concentrate', purchase: '1 oz per day', homeGrow: 'Up to 6 plants per adult' },
  CO: { possession: '1 oz', purchase: '1 oz per day', homeGrow: 'Up to 6 plants (3 mature) per adult' },
  CT: { possession: '1.5 oz in public; 5 oz secured at home', purchase: 'N/A', homeGrow: 'Up to 6 plants per adult (12 max per household)' },
  DC: { possession: '2 oz', purchase: 'Gift economy (no commercial sales)', homeGrow: 'Up to 6 plants (3 mature) per adult' },
  DE: { possession: '1 oz', purchase: '1 oz per transaction', homeGrow: 'Up to 3 mature plants per adult' },
  FL: { possession: '2.5 oz (medical patients only)', homeGrow: 'Not permitted' },
  IL: { possession: '30g flower; 5g concentrate; 500mg THC infused', purchase: 'Same as possession', homeGrow: 'Not permitted for adults (medical only — up to 5 plants)' },
  MA: { possession: '1 oz in public; 10 oz at home', purchase: '1 oz per transaction', homeGrow: 'Up to 6 plants per adult (12 per household)' },
  MD: { possession: '1.5 oz', purchase: 'N/A', homeGrow: 'Up to 2 plants per adult (4 per household)' },
  ME: { possession: '2.5 oz in public; unlimited at home', purchase: 'N/A', homeGrow: 'Up to 3 mature plants per adult' },
  MI: { possession: '2.5 oz in public; 10 oz at home', purchase: '2.5 oz per transaction', homeGrow: 'Up to 12 plants per household' },
  MN: { possession: '2 oz flower; 8g concentrate; 800mg THC edibles', homeGrow: 'Up to 8 plants (4 mature) per household' },
  MO: { possession: '3 oz', purchase: 'N/A', homeGrow: 'Up to 6 plants per adult' },
  MT: { possession: '1 oz; 8g concentrate', purchase: '1 oz per day', homeGrow: 'Up to 4 plants per adult' },
  NJ: { possession: '6 oz', purchase: '1 oz per transaction', homeGrow: 'Not permitted' },
  NM: { possession: '2 oz flower; 16g extract; 800mg edibles', purchase: 'N/A', homeGrow: 'Up to 6 mature plants; 12 total per household' },
  NV: { possession: '1 oz flower; 3.5g concentrate', purchase: '1 oz per day', homeGrow: 'Up to 6 plants per adult (12 per household)' },
  NY: { possession: '3 oz flower; 24g concentrate', purchase: 'N/A', homeGrow: 'Up to 6 plants per adult (12 per household)' },
  OH: { possession: '2.5 oz', purchase: 'N/A', homeGrow: 'Up to 6 plants per adult (12 per household)' },
  OR: { possession: '1 oz in public; 8 oz at home', purchase: '1 oz per day', homeGrow: 'Up to 4 plants per household' },
  RI: { possession: '1 oz in public; 10 oz at home', purchase: '1 oz per transaction', homeGrow: 'Up to 6 plants (3 mature) per adult' },
  VA: { possession: '1 oz in public; unlimited at home', purchase: 'N/A', homeGrow: 'Up to 4 plants per household' },
  VT: { possession: '1 oz in public; 2 oz at home', purchase: 'N/A', homeGrow: 'Up to 6 plants (2 mature) per household' },
  WA: { possession: '1 oz flower; 16g concentrate; 72 oz liquid', purchase: '1 oz per transaction', homeGrow: 'Not permitted' },
};

// ─── Real SVG Map ─────────────────────────────────────────────────────────
function USMap({
  theme,
  selectedCode,
  onSelect,
}: {
  theme: AppTheme;
  selectedCode: string | null;
  onSelect: (code: string) => void;
}) {
  const lawMap = useMemo(() => {
    const m: Record<string, StateLaw> = {};
    STATE_LAWS.forEach(l => { m[l.stateCode] = l; });
    return m;
  }, []);

  return (
    <View style={{ paddingHorizontal: MAP_PADDING, paddingTop: 8 }}>
      <Svg
        width={MAP_W}
        height={MAP_H}
        viewBox={US_MAP_VIEWBOX}
      >
        <G>
          {Object.entries(STATE_PATHS).map(([code, d]) => {
            const law = lawMap[code];
            const fill = law ? statusColor(law.status, theme) : theme.textMuted;
            const isSelected = selectedCode === code;
            return (
              <Path
                key={code}
                d={d}
                fill={fill}
                stroke={theme.bg}
                strokeWidth={isSelected ? 0 : 0.8}
                opacity={isSelected ? 1 : 0.88}
                onPress={() => onSelect(code)}
              />
            );
          })}
          {/* Selected state re-drawn on top with highlight stroke */}
          {selectedCode && STATE_PATHS[selectedCode] && (() => {
            const law = lawMap[selectedCode];
            const fill = law ? statusColor(law.status, theme) : theme.textMuted;
            return (
              <Path
                key={`${selectedCode}-sel`}
                d={STATE_PATHS[selectedCode]}
                fill={fill}
                stroke={theme.id === 'neon' ? '#FFFFFF' : theme.accent}
                strokeWidth={2.5}
                opacity={1}
                onPress={() => onSelect(selectedCode)}
              />
            );
          })()}
        </G>
      </Svg>
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────
function Legend({ theme }: { theme: AppTheme }) {
  const items: { status: LegalityStatus; label: string }[] = [
    { status: 'recreational', label: 'Recreational' },
    { status: 'medical', label: 'Medical' },
    { status: 'decriminalized', label: 'Decrim.' },
    { status: 'illegal', label: 'Illegal' },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: MAP_PADDING + 4, marginTop: 10 }}>
      {items.map(({ status, label }) => (
        <View key={status} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{
            width: 12, height: 12,
            borderRadius: theme.id === 'nature' ? 6 : 2,
            backgroundColor: statusColor(status, theme),
          }} />
          <Text style={{ color: theme.textMuted, fontSize: 11, fontFamily: theme.fontBody }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── State Detail Panel ───────────────────────────────────────────────────
function StateDetail({ law, theme, onClose }: { law: StateLaw; theme: AppTheme; onClose: () => void }) {
  const detail = STATE_DETAIL[law.stateCode];
  const color = statusColor(law.status, theme);
  return (
    <View style={{
      marginHorizontal: 16, marginTop: 12,
      backgroundColor: theme.surface,
      borderRadius: theme.cardRadius,
      borderWidth: Math.max(theme.cardBorderWidth, 1),
      borderColor: color,
      overflow: 'hidden',
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    }}>
      <View style={{ backgroundColor: color, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
        <View>
          <Text style={{ fontFamily: theme.fontDisplay, fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>
            {law.stateName}
          </Text>
          <Text style={{ fontFamily: theme.fontMono, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            {statusLabel(law.status).toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontFamily: theme.fontBody, fontSize: 13, color: theme.text, lineHeight: 20, marginBottom: 12 }}>
          {law.notes}
        </Text>
        {detail && (
          <>
            {detail.possession && <DetailRow icon="cube" label="Possession" value={detail.possession} theme={theme} />}
            {detail.purchase  && <DetailRow icon="cart"  label="Purchase Limit" value={detail.purchase}  theme={theme} />}
            {detail.homeGrow  && <DetailRow icon="leaf"  label="Home Grow"       value={detail.homeGrow}  theme={theme} />}
          </>
        )}
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value, theme }: { icon: string; label: string; value: string; theme: AppTheme }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
      <Ionicons name={icon as any} size={15} color={theme.textMuted} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
        <Text style={{ fontFamily: theme.fontBody, fontSize: 13, color: theme.text, marginTop: 1 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── State List Row ───────────────────────────────────────────────────────
function StateRow({ law, theme, selected, onPress }: {
  law: StateLaw; theme: AppTheme; selected: boolean; onPress: () => void;
}) {
  const color = statusColor(law.status, theme);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 11, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: theme.border,
        backgroundColor: selected ? theme.surfaceAlt : 'transparent',
      }}
    >
      <View style={{
        width: 10, height: 10, borderRadius: theme.id === 'nature' ? 5 : 2,
        backgroundColor: color, marginRight: 12,
      }} />
      <Text style={{ fontFamily: theme.fontMono, fontSize: 12, fontWeight: '700', color: theme.textSub, width: 28 }}>
        {law.stateCode}
      </Text>
      <Text style={{ fontFamily: theme.fontBody, fontSize: 14, color: theme.text, flex: 1 }}>
        {law.stateName}
      </Text>
      <View style={{ backgroundColor: color + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
        <Text style={{ fontFamily: theme.fontMono, fontSize: 9, fontWeight: '700', color }}>
          {statusLabel(law.status).toUpperCase().slice(0, 5)}
        </Text>
      </View>
      <Ionicons name={selected ? 'chevron-up' : 'chevron-down'} size={14} color={theme.textMuted} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────
export function LegalityScreen() {
  const { theme } = useTheme();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<LegalityStatus | 'all'>('all');

  const sortedLaws = useMemo(() =>
    [...STATE_LAWS].sort((a, b) => a.stateName.localeCompare(b.stateName)),
    []
  );

  const filteredLaws = useMemo(() =>
    filterStatus === 'all' ? sortedLaws : sortedLaws.filter(l => l.status === filterStatus),
    [sortedLaws, filterStatus]
  );

  const selectedLaw = useMemo(() =>
    selectedCode ? STATE_LAWS.find(l => l.stateCode === selectedCode) ?? null : null,
    [selectedCode]
  );

  const handleSelect = (code: string) => {
    setSelectedCode(prev => prev === code ? null : code);
  };

  const FILTERS: { value: LegalityStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'recreational', label: 'Rec' },
    { value: 'medical', label: 'Med' },
    { value: 'decriminalized', label: 'Decrim' },
    { value: 'illegal', label: 'Illegal' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* ── Header ── */}
      <View style={{
        backgroundColor: theme.headerBg,
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: theme.id === 'underground' || theme.id === 'neon' ? 1 : 0,
        borderBottomColor: theme.headerBorderColor,
      }}>
        <Text style={{
          fontFamily: theme.fontDisplay,
          fontSize: theme.id === 'underground' ? 22 : theme.id === 'neon' ? 18 : 20,
          fontWeight: '700', color: theme.headerText,
          letterSpacing: theme.id === 'underground' ? 3 : theme.id === 'neon' ? 2 : 0,
        }}>
          {theme.id === 'underground' ? 'LEGALITY' :
           theme.id === 'neon' ? '[ LEGALITY ]' :
           theme.id === 'retro' ? '✦ KNOW THE LAW ✦' :
           theme.id === 'nature' ? 'Green by State' : 'Legality'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Real SVG Map ── */}
        <USMap theme={theme} selectedCode={selectedCode} onSelect={handleSelect} />

        {/* ── Legend ── */}
        <Legend theme={theme} />

        {/* ── Selected State Detail (from map tap) ── */}
        {selectedLaw && (
          <StateDetail law={selectedLaw} theme={theme} onClose={() => setSelectedCode(null)} />
        )}

        {/* ── Filter Chips ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 4 }}>
          <Text style={{
            fontFamily: theme.fontMono, fontSize: 10, fontWeight: '700',
            color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
          }}>
            {theme.id === 'underground' ? 'FILTER BY STATUS' : theme.id === 'neon' ? '// FILTER' : 'Filter by Status'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FILTERS.map(f => {
              const active = filterStatus === f.value;
              const chipColor = f.value === 'all' ? theme.primary
                : f.value === 'recreational' ? theme.mapRecreational
                : f.value === 'medical' ? theme.mapMedical
                : f.value === 'decriminalized' ? theme.mapDecriminalized
                : theme.mapIllegal;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFilterStatus(f.value)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderRadius: theme.inputRadius, borderWidth: 1,
                    borderColor: active ? chipColor : theme.border,
                    backgroundColor: active ? chipColor : 'transparent',
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: theme.fontMono, fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : theme.textMuted }}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── State List ── */}
        <View style={{ marginTop: 8, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border }}>
          {filteredLaws.map(law => (
            <React.Fragment key={law.stateCode}>
              <StateRow
                law={law} theme={theme}
                selected={selectedCode === law.stateCode}
                onPress={() => handleSelect(law.stateCode)}
              />
              {selectedCode === law.stateCode && (
                <View style={{ paddingBottom: 4 }}>
                  <StateDetail law={law} theme={theme} onClose={() => setSelectedCode(null)} />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={{
          fontFamily: theme.fontMono, fontSize: 11, color: theme.textMuted,
          textAlign: 'center', marginTop: 16, letterSpacing: 0.5,
        }}>
          {filteredLaws.length} of 51 jurisdictions shown
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
