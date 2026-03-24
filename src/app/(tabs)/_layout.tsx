import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { useDrawer } from '@/components/ui/drawer-context';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { HomeLoadingProvider } from '@/components/ui/home-loading-context';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { requestDirectMode } from '@/services/direct-mode-intent';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

const APP_BAR_LOGO_SOURCE = require('@/assets/images/logos/app-bar-logo.png');
const HOME_SKELETON_DURATION_MS = 1400;

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const drawer = useDrawer();
  const scheme = useColorScheme();
  const normalizedScheme = scheme === 'dark' ? 'dark' : 'light';
  const localTheme = useTheme();
  const program = useLiveProgramInfo();
  const insets = useSafeAreaInsets();
  const liveCardBottom = insets.bottom + 76;
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const [isHomeLoading, setIsHomeLoading] = React.useState(true);
  const isSearchScreen = pathname === '/search';
  const isDirectScreen = pathname === '/direct';
  const usesCustomScreenHeader = isSearchScreen || isDirectScreen;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsHomeLoading(false);
    }, HOME_SKELETON_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleLive = React.useCallback(() => {
    if (!isLiveStreamConfigured) {
      return;
    }

    void toggleLiveAudio({
      title: program.title,
      artist: program.host,
      albumTitle: program.schedule,
    });
  }, [program.host, program.schedule, program.title]);

  return (
    <HomeLoadingProvider value={isHomeLoading}>
      <View style={[styles.container, { backgroundColor: localTheme.surfaceMuted }]}>
        <StatusBar
          style={normalizedScheme === 'light' ? 'light' : 'dark'}
        />

        {!usesCustomScreenHeader ? (
          <AppTopBar
            leftAction={{ icon: 'menu', onPress: drawer.open }}
            rightAction={{ icon: 'search', onPress: () => router.push('/search') }}
            centerContent={
              <Image
                source={APP_BAR_LOGO_SOURCE}
                style={styles.headerLogo}
                cachePolicy="memory-disk"
                contentFit="contain"
                transition={0}
              />
            }
          />
        ) : null}

        <View style={styles.tabsContainer}>
          <AppTabs />
        </View>

        {!usesCustomScreenHeader ? (
          <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
            <LiveAudioCard
              loading={isHomeLoading}
              title={program.title}
              subtitle={program.schedule || undefined}
              onPressCard={() => {
                requestDirectMode('audio');
                router.push('/direct');
              }}
              onPressPlay={handleToggleLive}
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              disabled={!isLiveStreamConfigured}
            />
          </View>
        ) : null}
      </View>
    </HomeLoadingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLogo: {
    width: 119,
    height: 35,
  },
  tabsContainer: {
    flex: 1,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
