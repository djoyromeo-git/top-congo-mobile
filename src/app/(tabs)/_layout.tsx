import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus } from '@/services/live-audio';

export default function TabsLayout() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const normalizedScheme = scheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[normalizedScheme];
  const localTheme = useTheme();
  const insets = useSafeAreaInsets();
  const liveCardBottom = insets.bottom + 76;
  const { isPlaying, isBuffering } = useLiveAudioStatus();

  const handleToggleLive = React.useCallback(() => {
    if (!isLiveStreamConfigured) {
      return;
    }

    void toggleLiveAudio({
      title: t('homeFeed.liveCardTitle').replace('\n', ' '),
      artist: t('tabs.brand'),
      albumTitle: t('auth.liveBadge'),
    });
  }, [t]);

  return (
    <View style={[styles.container, { backgroundColor: localTheme.surfaceMuted }]}>
      <StatusBar
        style={normalizedScheme === 'light' ? 'light' : 'dark'}
      />

      <AppTopBar
        leftAction={{ icon: 'menu', onPress: () => {} }}
        rightAction={{ icon: 'search', onPress: () => {} }}
        logo={
          <Image
            source={require('@/assets/images/logos/app-bar-logo.svg')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
      />

      <View style={styles.tabsContainer}>
        <AppTabs />
      </View>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          title={t('homeFeed.liveCardTitle')}
          onPressPlay={handleToggleLive}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          disabled={!isLiveStreamConfigured}
        />
      </View>
    </View>
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
