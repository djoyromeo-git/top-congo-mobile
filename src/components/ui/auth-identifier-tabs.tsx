import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export type AuthIdentifierMode = 'email' | 'phone';

type AuthIdentifierTabsProps = {
  value: AuthIdentifierMode;
  onChange: (value: AuthIdentifierMode) => void;
  emailLabel: string;
  phoneLabel: string;
};

export function AuthIdentifierTabs({
  value,
  onChange,
  emailLabel,
  phoneLabel,
}: AuthIdentifierTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#E6EFFA' }]}>
      <TabButton
        label={emailLabel}
        isActive={value === 'email'}
        onPress={() => onChange('email')}
        activeColor={theme.secondary}
      />
      <TabButton
        label={phoneLabel}
        isActive={value === 'phone'}
        onPress={() => onChange('phone')}
        activeColor={theme.secondary}
      />
    </View>
  );
}

function TabButton({
  label,
  isActive,
  onPress,
  activeColor,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        isActive && { backgroundColor: activeColor },
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.label, { color: isActive ? Palette.neutral['100'] : '#5A6484' }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  label: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.88,
  },
});
