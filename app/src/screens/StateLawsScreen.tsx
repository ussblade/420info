import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { STATE_LAWS } from '../data/stateLaws';
import { LegalityBadge } from '../components/LegalityBadge';
import type { StateLaw } from '../types';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from '../constants/theme';

export function StateLawsScreen() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return STATE_LAWS;
    const q = query.toLowerCase();
    return STATE_LAWS.filter(
      s =>
        s.stateName.toLowerCase().includes(q) ||
        s.stateCode.toLowerCase().includes(q) ||
        s.status.includes(q)
    );
  }, [query]);

  const toggleExpand = (stateCode: string) => {
    setExpanded(prev => (prev === stateCode ? null : stateCode));
  };

  const renderItem: ListRenderItem<StateLaw> = ({ item }) => {
    const isExpanded = expanded === item.stateCode;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => toggleExpand(item.stateCode)}
        activeOpacity={0.75}
      >
        <View style={styles.rowMain}>
          <View style={styles.stateInfo}>
            <Text style={styles.stateCode}>{item.stateCode}</Text>
            <Text style={styles.stateName}>{item.stateName}</Text>
          </View>
          <View style={styles.rowRight}>
            <LegalityBadge status={item.status} size="sm" />
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.notes}>
            <View style={styles.notesPills}>
              {item.medicalLegal && (
                <Pill label="Medical ✓" color={Colors.medical} />
              )}
              {item.recreationalLegal && (
                <Pill label="Recreational ✓" color={Colors.recreational} />
              )}
            </View>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>State Laws</Text>
        <Text style={styles.subtitle}>Cannabis legality by US state</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by state name or status…"
          placeholderTextColor={Colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(['recreational', 'medical', 'decriminalized', 'illegal'] as const).map(s => (
          <LegalityBadge key={s} status={s} size="sm" />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.stateCode}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color, backgroundColor: color + '22' }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    padding: 0,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.background,
  },
  rowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  stateCode: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    width: 32,
  },
  stateName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notes: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  notesPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
