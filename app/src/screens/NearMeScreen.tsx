import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { useDispensaries } from '../hooks/useDispensaries';
import { DispensaryCard } from '../components/DispensaryCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Dispensary } from '../types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

export function NearMeScreen() {
  const { coordinates, loading: locationLoading, error: locationError, requestLocation } =
    useLocation();

  const {
    dispensaries,
    loading: dispensariesLoading,
    error: dispensariesError,
    stale,
    refresh,
  } = useDispensaries(
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  );

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = locationLoading || (coordinates !== null && dispensariesLoading && dispensaries.length === 0);

  if (isLoading) {
    return (
      <LoadingOverlay
        message={locationLoading ? 'Getting your location…' : 'Finding dispensaries near you…'}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Near Me</Text>
          {coordinates && (
            <Text style={styles.subtitle}>
              {dispensaries.length} dispensaries found
            </Text>
          )}
        </View>
        {coordinates && (
          <TouchableOpacity onPress={refresh} style={styles.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Location error */}
      {locationError && (
        <ErrorBanner
          message={locationError}
          onRetry={requestLocation}
        />
      )}

      {/* Stale data notice */}
      {stale && (
        <ErrorBanner
          message="Showing cached data — live refresh unavailable."
          onRetry={refresh}
        />
      )}

      {/* Dispensary load error */}
      {dispensariesError && !locationError && (
        <ErrorBanner
          message={dispensariesError}
          onRetry={refresh}
        />
      )}

      {/* No location yet */}
      {!coordinates && !locationLoading && !locationError && (
        <EmptyState
          icon="location-outline"
          title="Location needed"
          message="Tap the button below to find dispensaries near you."
          action={{ label: 'Enable Location', onPress: requestLocation }}
        />
      )}

      {/* Permission denied — no location */}
      {!coordinates && locationError && (
        <EmptyState
          icon="location-outline"
          title="Location unavailable"
          message={locationError}
          action={{ label: 'Try Again', onPress: requestLocation }}
        />
      )}

      {/* Results */}
      {coordinates && (
        <FlatList
          data={dispensaries}
          keyExtractor={item => item.id}
          renderItem={({ item }: { item: Dispensary }) => <DispensaryCard dispensary={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={dispensariesLoading}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            !dispensariesLoading ? (
              <EmptyState
                icon="storefront-outline"
                title="No dispensaries found"
                message="No cannabis dispensaries were found within 10 miles of your location."
                action={{ label: 'Refresh', onPress: refresh }}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}

function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={48} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action && (
        <TouchableOpacity style={styles.emptyBtn} onPress={action.onPress} activeOpacity={0.8}>
          <Text style={styles.emptyBtnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshBtn: {
    padding: Spacing.sm,
  },
  list: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
