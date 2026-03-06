import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type SocialProvider = 'apple' | 'google';

type SocialAuthButtonProps = Omit<PressableProps, 'style'> & {
  provider: SocialProvider;
  label?: string;
};

export function SocialAuthButton({ provider, label, ...props }: SocialAuthButtonProps) {
  const theme = useTheme();
  const isApple = provider === 'apple';

  const defaultLabel = isApple ? 'Continuer avec Apple' : 'Continuer avec Google';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}
      {...props}>
      <View style={styles.content}>
        <FontAwesome name={provider} size={34 / 1.4} color={isApple ? theme.text : '#4285F4'} />
        <ThemedText style={styles.label}>{label ?? defaultLabel}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 18 / 1.2,
    lineHeight: 25 / 1.2,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.85,
  },
});

