import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
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
          borderColor: selected ? theme.primaryMuted : theme.border,
          backgroundColor: selected ? Palette.blue['100'] : 'transparent',
        },
        pressed && styles.pressed,
      ]}
      {...props}>
      {!!emoji && <ThemedText style={styles.emoji}>{emoji}</ThemedText>}
      <ThemedText style={styles.label}>{label}</ThemedText>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: theme.secondary }]}>
          <Feather name="check" size={14} color={theme.onPrimary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  label: {
    fontSize: 18 / 1.2,
    lineHeight: 24 / 1.2,
    fontWeight: 600,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
});
