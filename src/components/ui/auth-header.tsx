import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function AuthHeader({ title, subtitle, actionLabel, onPressAction }: AuthHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, { color: theme.primary }]}>{title}</ThemedText>
      {(subtitle || actionLabel) && (
        <View style={styles.inlineRow}>
          {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
          {!!actionLabel && (
            <Pressable onPress={onPressAction} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText style={[styles.actionText, { color: theme.primary }]}>{actionLabel}</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 52 / 1.6,
    lineHeight: 42,
    fontWeight: 700,
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.one,
    rowGap: Spacing.half,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20 / 1.2,
    lineHeight: 34 / 1.2,
    fontWeight: 500,
  },
  actionText: {
    fontSize: 20 / 1.2,
    lineHeight: 34 / 1.2,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.75,
  },
});

