import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/i18n';

void SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded] = useFonts({
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </KeyboardProvider>
  );
}

export default Sentry.wrap(RootLayout);
