import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { SocialAuthButton } from '@/components/ui/social-auth-button';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppleSignInButton } from '@/features/auth/presentation/apple-sign-in-button';
import { useSocialAuth } from '@/features/auth/presentation/use-auth-session';

type SocialAuthActionsProps = {
  appleButtonType?: AppleAuthentication.AppleAuthenticationButtonType;
};

export function SocialAuthActions({
  appleButtonType = AppleAuthentication.AppleAuthenticationButtonType.CONTINUE,
}: SocialAuthActionsProps) {
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

      {capabilities.apple ? (
        <AppleSignInButton
          buttonType={appleButtonType}
          loading={isSigningIn && activeProvider === 'apple'}
          onPress={handleApplePress}
        />
      ) : null}

      <SocialAuthButton
        provider="google"
        disabled={!isHydrated || isSigningIn}
        loading={isSigningIn && activeProvider === 'google'}
        onPress={() => {
          void handleGooglePress();
        }}
      />

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
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
});
