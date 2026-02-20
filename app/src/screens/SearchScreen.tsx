import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSearchDispensaries } from '../hooks/useSearchDispensaries';
import { DispensaryCard } from '../components/DispensaryCard';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Dispensary, NominatimPlace } from '../types';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from '../constants/theme';

export function SearchScreen() {
  const {
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
  } = useSearchDispensaries();

  const showSuggestions = suggestions.length > 0 && !selectedPlace;
  const showResults = selectedPlace !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find dispensaries by city or address</Text>
      </View>

      {/* Search input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter city, address, or zip code…"
          placeholderTextColor={Colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {suggestionsLoading && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
        {query.length > 0 && !suggestionsLoading && (
          <TouchableOpacity onPress={clearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Nominatim suggestions dropdown */}
      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map(place => (
            <SuggestionRow
              key={place.placeId}
              place={place}
              onSelect={() => {
                Keyboard.dismiss();
                selectPlace(place);
              }}
            />
          ))}
        </View>
      )}

      {/* Error */}
      {dispensariesError && showResults && (
        <ErrorBanner message={dispensariesError} onRetry={refresh} />
      )}

      {/* Results or empty state */}
      {showResults ? (
        <FlatList
          data={dispensaries}
          keyExtractor={(item: Dispensary) => item.id}
          renderItem={({ item }: { item: Dispensary }) => (
            <DispensaryCard dispensary={item} />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={dispensariesLoading}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListHeaderComponent={
            selectedPlace ? (
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={14} color={Colors.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {selectedPlace.displayName.split(',').slice(0, 2).join(',')}
                </Text>
                <Text style={styles.resultCount}>
                  {dispensaries.length} found
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !dispensariesLoading ? (
              <View style={styles.empty}>
                <Ionicons name="storefront-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No dispensaries found</Text>
                <Text style={styles.emptyMessage}>
                  No cannabis dispensaries were found near this location.
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        !showSuggestions && (
          <View style={styles.prompt}>
            <View style={styles.promptIconWrap}>
              <Ionicons name="leaf-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.promptTitle}>Find Dispensaries</Text>
            <Text style={styles.promptText}>
              Type a city, neighborhood, or zip code above to search for cannabis
              dispensaries anywhere in the US.
            </Text>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

interface SuggestionRowProps {
  place: NominatimPlace;
  onSelect: () => void;
}

function SuggestionRow({ place, onSelect }: SuggestionRowProps) {
  // Show just the first 2 parts of the display_name for brevity
  const parts = place.displayName.split(',');
  const primary = parts[0].trim();
  const secondary = parts.slice(1, 3).join(',').trim();

  return (
    <TouchableOpacity style={styles.suggestion} onPress={onSelect} activeOpacity={0.7}>
      <Ionicons name="location-outline" size={16} color={Colors.textMuted} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.suggestionPrimary} numberOfLines={1}>
          {primary}
        </Text>
        {secondary && (
          <Text style={styles.suggestionSecondary} numberOfLines={1}>
            {secondary}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
    </TouchableOpacity>
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
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    padding: 0,
  },
  suggestions: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  suggestionPrimary: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  suggestionSecondary: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  locationText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  resultCount: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  prompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  promptIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  promptTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  promptText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
