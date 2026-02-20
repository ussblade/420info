import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Dispensary } from '../types';
import { openDirections, callPhone, openWebsite } from '../utils/maps';
import { formatPhone, formatDistance, formatAddress } from '../utils/formatters';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
  Shadow,
} from '../constants/theme';

interface Props {
  dispensary: Dispensary;
}

export function DispensaryCard({ dispensary }: Props) {
  const {
    name,
    address,
    city,
    state,
    zip,
    phone,
    website,
    openingHours,
    distanceMiles,
    source,
    licenseNumber,
  } = dispensary;

  const fullAddress = formatAddress(address, city, state, zip);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {source === 'osm' && (
            <View style={styles.osmBadge}>
              <Text style={styles.osmText}>OSM</Text>
            </View>
          )}
        </View>
        {distanceMiles !== undefined && (
          <Text style={styles.distance}>{formatDistance(distanceMiles)}</Text>
        )}
      </View>

      {/* Address */}
      {fullAddress.trim() && (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.detail} numberOfLines={2}>
            {fullAddress}
          </Text>
        </View>
      )}

      {/* Hours */}
      {openingHours && (
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.detail} numberOfLines={1}>
            {openingHours}
          </Text>
        </View>
      )}

      {/* License number (scraped data only) */}
      {licenseNumber && (
        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
          <Text style={[styles.detail, styles.licenseText]}>
            License: {licenseNumber}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <ActionButton
          icon="navigate-outline"
          label="Directions"
          color={Colors.primary}
          onPress={() => openDirections(dispensary.latitude, dispensary.longitude, name)}
        />
        {phone && (
          <ActionButton
            icon="call-outline"
            label="Call"
            color={Colors.medical}
            onPress={() => callPhone(phone)}
          />
        )}
        {website && (
          <ActionButton
            icon="globe-outline"
            label="Website"
            color={Colors.textSecondary}
            onPress={() => openWebsite(website)}
          />
        )}
      </View>

      {/* Phone secondary display */}
      {phone && (
        <TouchableOpacity onPress={() => callPhone(phone)} activeOpacity={0.7}>
          <Text style={styles.phoneText}>{formatPhone(phone)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

function ActionButton({ icon, label, color, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm - 2,
    gap: Spacing.sm - 2,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    flexShrink: 1,
  },
  osmBadge: {
    backgroundColor: Colors.textMuted + '33',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  osmText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  distance: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
    lineHeight: 18,
    marginTop: -1,
  },
  licenseText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm - 2,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  phoneText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: -2,
  },
});
