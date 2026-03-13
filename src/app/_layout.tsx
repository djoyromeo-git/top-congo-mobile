import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Entypo, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';

import { AuthSessionProvider } from '@/features/auth/presentation/auth-session-provider';
import '@/features/notifications/infrastructure/background-notification-task';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationBootstrap } from '@/features/notifications/presentation/use-notification-bootstrap';
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

function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationBootstrap();
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [fontsLoaded] = useFonts({
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
    ...Feather.font,
    ...Entypo.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
    ...FontAwesome5.font,
  });

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

  if (!fontsLoaded || !assetsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <AppQueryProvider>
        <AuthSessionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="drawer" options={{ presentation: 'transparentModal', animation: 'none' }} />
            </Stack>
          </ThemeProvider>
        </AuthSessionProvider>
      </AppQueryProvider>
    </KeyboardProvider>
  );
}

export default Sentry.wrap(RootLayout);
