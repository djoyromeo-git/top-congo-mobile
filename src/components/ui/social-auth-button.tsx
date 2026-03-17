import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { AppleLogo } from 'phosphor-react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type SocialProvider = 'apple' | 'google';

type SocialAuthButtonProps = Omit<PressableProps, 'style'> & {
  provider: SocialProvider;
  label?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SocialAuthButton({ provider, label, loading = false, disabled, style, ...props }: SocialAuthButtonProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isApple = provider === 'apple';

  const defaultLabel = isApple ? t('auth.continueWithApple') : t('auth.continueWithGoogle');

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundElement },
        style,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...props}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.text} size="small" />
        ) : isApple ? (
          <AppleLogo size={20} weight="fill" color={theme.text} />
        ) : (
          <Image source={require('@/assets/images/google-logo.png')} style={styles.googleLogo} contentFit="contain" />
        )}
        <ThemedText style={styles.label}>{label ?? defaultLabel}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 46,
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
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 500,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
