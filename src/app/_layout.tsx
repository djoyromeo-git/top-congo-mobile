import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import React from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { DrawerProvider, useDrawer } from '@/components/ui/drawer-context';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import { AuthSessionProvider } from '@/features/auth/presentation/auth-session-provider';
import '@/features/notifications/infrastructure/background-notification-task';
import { useNotificationBootstrap } from '@/features/notifications/presentation/use-notification-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import '@/i18n';
import { AppQueryProvider } from '@/shared/query/query-provider';

void SplashScreen.preventAutoHideAsync();

const PRELOADED_IMAGE_ASSETS = [
  require('@/assets/expo.icon/Assets/logo-all-white.png'),
  require('@/assets/expo.icon/Assets/logo.png'),
  require('@/assets/images/logo-glow.png'),
  require('@/assets/images/logos/app-bar-logo.png'),
  require('@/assets/images/waveform-top-congo.png'),
  require('@/assets/images/live/live-wave.svg'),
  require('@/assets/images/google-logo.png'),
];

if (!Sentry.getClient()) {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  const environment =
    process.env.EXPO_PUBLIC_SENTRY_ENV?.trim() ||
    process.env.EXPO_PUBLIC_APP_ENV?.trim() ||
    (__DEV__ ? 'development' : 'production');
  const tracesSampleRate = Number(process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);

  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
  });

  Sentry.setTag('app.env', environment);
  Sentry.setTag('app.platform', 'react-native');

  const appVersion = Constants.expoConfig?.version?.trim();
  if (appVersion) {
    Sentry.setTag('app.version', appVersion);
  }
}

function useAppUpdatePrompt(isUiReady: boolean) {
  const { isUpdatePending } = Updates.useUpdates();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const [hasPendingPrompt, setHasPendingPrompt] = React.useState(false);
  const hasPromptedForUpdateRef = React.useRef(false);
  const isCheckingForUpdateRef = React.useRef(false);

  const queueUpdatePrompt = React.useEffectEvent(() => {
    if (hasPromptedForUpdateRef.current || !Updates.isEnabled) {
      return;
    }

    setHasPendingPrompt(true);
  });

  const checkForUpdates = React.useEffectEvent(async (reason: 'launch' | 'foreground') => {
    if (!Updates.isEnabled || isCheckingForUpdateRef.current || isUpdatePending) {
      return;
    }

    isCheckingForUpdateRef.current = true;

    try {
      const checkResult = await Updates.checkForUpdateAsync();

      if (!checkResult.isAvailable) {
        return;
      }

      const fetchResult = await Updates.fetchUpdateAsync();

      if (fetchResult.isNew || fetchResult.isRollBackToEmbedded) {
        queueUpdatePrompt();
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          feature: 'updates',
          action: 'checkForUpdateAsync',
          reason,
        },
      });
    } finally {
      isCheckingForUpdateRef.current = false;
    }
  });

  React.useEffect(() => {
    if (!Updates.isEnabled) {
      return;
    }

    void checkForUpdates('launch');

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        void checkForUpdates('foreground');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isUpdatePending]);

  React.useEffect(() => {
    if (!Updates.isEnabled || !isUpdatePending) {
      return;
    }

    queueUpdatePrompt();
  }, [isUpdatePending]);

  React.useEffect(() => {
    if (!isUiReady || !hasPendingPrompt || hasPromptedForUpdateRef.current) {
      return;
    }

    hasPromptedForUpdateRef.current = true;
    setIsVisible(true);
  }, [hasPendingPrompt, isUiReady]);

  const dismiss = React.useEffectEvent(() => {
    setIsVisible(false);
  });

  const reload = React.useEffectEvent(async () => {
    setIsReloading(true);

    try {
      await Updates.reloadAsync();
    } catch (error) {
      setIsReloading(false);
      hasPromptedForUpdateRef.current = false;
      setIsVisible(true);
      Sentry.captureException(error, {
        tags: {
          feature: 'updates',
          action: 'reloadAsync',
        },
      });
    }
  });

  return {
    isVisible,
    isReloading,
    dismiss,
    reload,
  };
}

function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationBootstrap();
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [fontsLoaded] = useFonts({
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
  });
  const isUiReady = fontsLoaded && assetsLoaded;
  const updatePrompt = useAppUpdatePrompt(isUiReady);

  React.useEffect(() => {
    let cancelled = false;

    void Asset.loadAsync(PRELOADED_IMAGE_ASSETS).then(() => {
      if (!cancelled) {
        setAssetsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (fontsLoaded && assetsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [assetsLoaded, fontsLoaded]);

  if (!isUiReady) {
    return null;
  }

  return (
    <KeyboardProvider>
      <AppQueryProvider>
        <AuthSessionProvider>
          <DrawerProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack initialRouteName="index" screenOptions={{ headerShown: false }} />
              <DrawerOverlay />
              <UpdatePromptModal
                isVisible={updatePrompt.isVisible}
                isReloading={updatePrompt.isReloading}
                onDismiss={updatePrompt.dismiss}
                onReload={updatePrompt.reload}
              />
            </ThemeProvider>
          </DrawerProvider>
        </AuthSessionProvider>
      </AppQueryProvider>
    </KeyboardProvider>
  );
}

export default Sentry.wrap(RootLayout);

function DrawerOverlay() {
  const drawer = useDrawer();
  return <DrawerPanel isOpen={drawer.isOpen} onClose={drawer.close} />;
}

type UpdatePromptModalProps = {
  isVisible: boolean;
  isReloading: boolean;
  onDismiss: () => void;
  onReload: () => void;
};

function UpdatePromptModal({ isVisible, isReloading, onDismiss, onReload }: UpdatePromptModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={isReloading ? undefined : onDismiss}>
      <View style={styles.updateBackdrop}>
        <View
          style={[
            styles.updateCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.homeChipBorder,
              shadowColor: theme.shadow,
            },
          ]}>
          <View style={styles.updateHeader}>
            <View style={styles.updateBadgeRow}>
              <View style={[styles.updateBadge, { backgroundColor: theme.primary }]}>
                <ThemedText style={[styles.updateBadgeText, { color: theme.onPrimary }]}>
                  {t('updates.badge')}
                </ThemedText>
              </View>
              <View style={styles.updateAccentCluster}>
                <View style={[styles.updateAccentBar, { backgroundColor: theme.primary }]} />
                <View style={[styles.updateAccentDot, { backgroundColor: Palette.red['800'] }]} />
              </View>
            </View>
            <ThemedText style={styles.updateTitle}>{t('updates.title')}</ThemedText>
            <ThemedText style={[styles.updateBody, { color: theme.homeSubtitle }]}>
              {t('updates.description')}
            </ThemedText>
          </View>

          <View style={styles.updateActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isReloading}
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.updateSecondaryButton,
                {
                  borderColor: theme.homeChipBorder,
                  backgroundColor: theme.homeChipBackground,
                  opacity: isReloading ? 0.65 : pressed ? 0.88 : 1,
                },
              ]}>
              <ThemedText style={styles.updateSecondaryLabel}>{t('updates.later')}</ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isReloading}
              onPress={() => {
                void onReload();
              }}
              style={({ pressed }) => [
                styles.updatePrimaryButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isReloading ? 0.88 : pressed ? 0.92 : 1,
                },
              ]}>
              {isReloading ? (
                <ActivityIndicator size="small" color={theme.onPrimary} />
              ) : (
                <ThemedText style={[styles.updatePrimaryLabel, { color: theme.onPrimary }]}>
                  {t('updates.restart')}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  updateBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 20, 0.56)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  updateCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 34,
    elevation: 10,
  },
  updateHeader: {
    gap: 14,
  },
  updateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  updateBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  updateBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  updateAccentCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateAccentBar: {
    width: 34,
    height: 6,
    borderRadius: 999,
  },
  updateAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  updateTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  updateBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  updateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  updateSecondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  updatePrimaryButton: {
    flex: 1.15,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  updateSecondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  updatePrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
