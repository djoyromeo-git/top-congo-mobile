import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { SocialAuthButton } from '@/components/ui/social-auth-button';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSocialAuth } from '@/features/auth/presentation/use-auth-session';

export function SocialAuthActions() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    capabilities,
    activeProvider,
    errorTranslationKey,
    isHydrated,
    isSigningIn,
    signInWithApple,
    signInWithGoogle,
  } = useSocialAuth();

  const handleApplePress = React.useCallback(async () => {
    const isSignedIn = await signInWithApple();
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [router, signInWithApple]);

  const handleGooglePress = React.useCallback(async () => {
    const isSignedIn = await signInWithGoogle();
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [router, signInWithGoogle]);

  return (
    <View style={styles.container}>
      {!isHydrated ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Palette.blue['800']} />
        </View>
      ) : null}

      <View style={styles.row}>
        {capabilities.apple ? (
          <SocialAuthButton
            provider="apple"
            label={t('auth.withApple')}
            disabled={!isHydrated || isSigningIn}
            loading={isSigningIn && activeProvider === 'apple'}
            style={styles.button}
            onPress={() => {
              void handleApplePress();
            }}
          />
        ) : null}

        <SocialAuthButton
          provider="google"
          label={t('auth.withGoogle')}
          disabled={!isHydrated || isSigningIn}
          loading={isSigningIn && activeProvider === 'google'}
          style={styles.button}
          onPress={() => {
            void handleGooglePress();
          }}
        />
      </View>

      {errorTranslationKey ? (
        <ThemedText style={[styles.errorText, { color: theme.danger }]}>
          {t(errorTranslationKey)}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
});
