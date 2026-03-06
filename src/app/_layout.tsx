import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { OnboardingFirstScreen } from '@/components/ui/onboarding-first-screen';
import '@/i18n';

void SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showFirstScreen, setShowFirstScreen] = React.useState(true);
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {showFirstScreen ? (
        <OnboardingFirstScreen
          onPressCreateAccount={() => {
            setShowFirstScreen(false);
            setTimeout(() => {
              router.push('/auth-preview');
            }, 0);
          }}
          onPressTryPremium={() => {
            setShowFirstScreen(false);
          }}
        />
      ) : (
        <AppTabs />
      )}
    </ThemeProvider>
  );
}
