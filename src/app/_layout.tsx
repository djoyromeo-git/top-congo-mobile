import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Entypo, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  const [fontsLoaded] = useFonts({
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
    ...Feather.font,
    ...Entypo.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome5.font,
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
