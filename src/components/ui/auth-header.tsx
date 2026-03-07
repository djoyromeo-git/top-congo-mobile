import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type AuthHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  onPressAction?: () => void;
  align?: 'left' | 'center';
};

export function AuthHeader({
  title,
  subtitle,
  actionLabel,
  onPressAction,
  align = 'left',
}: AuthHeaderProps) {
  const theme = useTheme();
  const centered = align === 'center';

  return (
    <View style={[styles.container, centered && styles.containerCentered]}>
      <ThemedText style={[styles.title, { color: theme.primary }, centered && styles.textCentered]}>
        {title}
      </ThemedText>
      {(subtitle || actionLabel) && (
        <View style={[styles.inlineRow, centered && styles.inlineRowCentered]}>
          {!!subtitle &&
            (typeof subtitle === 'string' ? (
              <ThemedText style={[styles.subtitle, centered && styles.textCentered]}>{subtitle}</ThemedText>
            ) : (
              subtitle
            ))}
          {!!actionLabel && (
            <Pressable onPress={onPressAction} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText style={[styles.actionText, { color: theme.primary }, centered && styles.textCentered]}>
                {actionLabel}
              </ThemedText>
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
  containerCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 27,
    fontWeight: 700,
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.one,
    rowGap: Spacing.half,
    alignItems: 'center',
  },
  inlineRowCentered: {
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  textCentered: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
