import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LegalityStatus } from '../types';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../constants/theme';

interface Props {
  status: LegalityStatus;
  size?: 'sm' | 'md';
}

const LABELS: Record<LegalityStatus, string> = {
  recreational: 'Recreational',
  medical: 'Medical',
  decriminalized: 'Decriminalized',
  illegal: 'Illegal',
};

const STATUS_COLORS: Record<LegalityStatus, string> = {
  recreational: Colors.recreational,
  medical: Colors.medical,
  decriminalized: Colors.decriminalized,
  illegal: Colors.illegal,
};

export function LegalityBadge({ status, size = 'md' }: Props) {
  const color = STATUS_COLORS[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '22', borderColor: color },
        isSmall && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, isSmall && styles.labelSm]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs - 2,
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: FontSize.xs,
  },
});
