import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import React from 'react';
import { ActivityIndicator, AppState, Modal, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
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
import { AsyncStorageJsonStore } from '@/shared/storage/async-storage-json-store';
import { useLivePlaybackErrorState } from '@/services/live-audio';

void SplashScreen.preventAutoHideAsync();

type PersistedPendingUpdatePrompt = {
  kind: 'update' | 'rollback';
  updateId?: string;
};

const pendingUpdatePromptStore = new AsyncStorageJsonStore<PersistedPendingUpdatePrompt>(
  'app.update.pending-prompt'
);

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
  const { currentlyRunning, downloadedUpdate, isUpdatePending } = Updates.useUpdates();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const [hasPendingPrompt, setHasPendingPrompt] = React.useState(false);
  const hasPromptedForUpdateRef = React.useRef(false);
  const isCheckingForUpdateRef = React.useRef(false);
  const pendingUpdateRef = React.useRef<PersistedPendingUpdatePrompt | null>(null);

  const persistPendingUpdate = React.useEffectEvent(
    async (pendingUpdate: PersistedPendingUpdatePrompt) => {
      pendingUpdateRef.current = pendingUpdate;
      await pendingUpdatePromptStore.set(pendingUpdate);
    }
  );

  const clearPendingUpdate = React.useEffectEvent(async () => {
    pendingUpdateRef.current = null;
    await pendingUpdatePromptStore.clear();
  });

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
        await persistPendingUpdate(
          fetchResult.isRollBackToEmbedded
            ? { kind: 'rollback' }
            : { kind: 'update', updateId: fetchResult.manifest.id }
        );
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

    let cancelled = false;

    void pendingUpdatePromptStore
      .get()
      .then(async storedPendingUpdate => {
        if (cancelled || !storedPendingUpdate) {
          return;
        }

        const hasAppliedStoredUpdate =
          storedPendingUpdate.kind === 'update'
            ? storedPendingUpdate.updateId != null &&
              storedPendingUpdate.updateId === currentlyRunning.updateId
            : currentlyRunning.isEmbeddedLaunch;

        if (hasAppliedStoredUpdate) {
          await clearPendingUpdate();
          return;
        }

        pendingUpdateRef.current = storedPendingUpdate;
        queueUpdatePrompt();
      })
      .catch(error => {
        Sentry.captureException(error, {
          tags: {
            feature: 'updates',
            action: 'restorePendingPrompt',
          },
        });
      });

    void checkForUpdates('launch');

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        void checkForUpdates('foreground');
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [currentlyRunning.isEmbeddedLaunch, currentlyRunning.updateId, isUpdatePending]);

  React.useEffect(() => {
    if (!Updates.isEnabled || !isUpdatePending) {
      return;
    }

    const pendingUpdate: PersistedPendingUpdatePrompt | null =
      downloadedUpdate?.type === Updates.UpdateInfoType.NEW
        ? { kind: 'update', updateId: downloadedUpdate.updateId }
        : downloadedUpdate?.type === Updates.UpdateInfoType.ROLLBACK
          ? { kind: 'rollback' }
          : pendingUpdateRef.current;

    if (pendingUpdate) {
      void persistPendingUpdate(pendingUpdate);
    }

    queueUpdatePrompt();
  }, [downloadedUpdate, isUpdatePending]);

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
    const pendingUpdate = pendingUpdateRef.current;

    try {
      await clearPendingUpdate();
      await Updates.reloadAsync();
    } catch (error) {
      setIsReloading(false);
      hasPromptedForUpdateRef.current = false;
      setIsVisible(true);
      if (pendingUpdate) {
        await persistPendingUpdate(pendingUpdate);
      }
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
  const { t } = useTranslation();
  useNotificationBootstrap();
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [fontsLoaded] = useFonts({
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
  });
  const isUiReady = fontsLoaded && assetsLoaded;
  const updatePrompt = useAppUpdatePrompt(isUiReady);
  const livePlaybackError = useLivePlaybackErrorState();
  const livePlaybackToastMessage = React.useMemo(() => {
    switch (livePlaybackError.messageKey) {
      case 'liveAudio.loadFailed':
        return t('liveAudio.loadFailed');
      default:
        return null;
    }
  }, [livePlaybackError.messageKey, t]);

  React.useEffect(() => {
    if (!livePlaybackError.messageKey || livePlaybackError.occurredAt === 0) {
      return;
    }

    setToastVisible(true);
  }, [livePlaybackError.messageKey, livePlaybackError.occurredAt]);

  React.useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 3200);

    return () => {
      clearTimeout(timer);
    };
  }, [toastVisible, livePlaybackError.occurredAt]);

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
              <AppToast
                isVisible={toastVisible}
                message={livePlaybackToastMessage}
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
            <View style={styles.updateAction}>
              <AppButton
                accessibilityRole="button"
                disabled={isReloading}
                label={t('updates.later')}
                onPress={onDismiss}
                variant="ghost"
                size="lg"
                style={[
                  styles.updateButton,
                  styles.updateGhostButton,
                  {
                    borderColor: theme.homeChipBorder,
                    backgroundColor: theme.homeChipBackground,
                  },
                ]}
                labelStyle={styles.updateGhostLabel}
              />
            </View>

            <View style={styles.updateAction}>
              <AppButton
                accessibilityRole="button"
                disabled={isReloading}
                label={t('updates.restart')}
                onPress={() => {
                  void onReload();
                }}
                size="lg"
                style={[styles.updateButton, styles.updatePrimaryButton]}
                labelStyle={styles.updatePrimaryLabel}
                rightAccessory={
                  isReloading ? <ActivityIndicator size="small" color={theme.onPrimary} /> : null
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AppToast({ isVisible, message }: { isVisible: boolean; message: string | null }) {
  const theme = useTheme();

  if (!isVisible || !message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.toastViewport}>
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: theme.background,
            borderColor: theme.homeChipBorder,
            shadowColor: theme.shadow,
          },
        ]}>
        <View style={[styles.toastAccent, { backgroundColor: Palette.red['800'] }]} />
        <ThemedText style={styles.toastLabel}>{message}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastViewport: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 20,
  },
  toastCard: {
    minHeight: 54,
    width: '100%',
    maxWidth: 460,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastAccent: {
    width: 8,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  toastLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
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
  updateAction: {
    flex: 1,
  },
  updatePrimaryButton: {
    minHeight: 52,
    borderRadius: 18,
  },
  updateButton: {
    minHeight: 52,
    borderRadius: 18,
  },
  updateGhostButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  updateGhostLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  updatePrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
