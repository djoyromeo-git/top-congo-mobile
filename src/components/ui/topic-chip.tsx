import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type TopicChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  emoji?: string;
  selected?: boolean;
};

export function TopicChip({ label, emoji, selected = false, ...props }: TopicChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.primary : theme.homeChipBorder,
          backgroundColor: selected ? theme.primary : theme.homeChipBackground,
        },
        pressed && styles.pressed,
      ]}
      {...props}>
      {!!emoji && <ThemedText style={styles.emoji}>{emoji}</ThemedText>}
      <ThemedText
        style={[
          styles.label,
          { color: selected ? theme.onPrimary : theme.homeChipText },
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 37,
    borderRadius: 36,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  pressed: {
    opacity: 0.85,
  },
});
