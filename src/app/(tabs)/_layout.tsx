import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function TabsLayout() {
  const router = useRouter();
  const scheme = useColorScheme();
  const normalizedScheme = scheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[normalizedScheme];
  const localTheme = useTheme();
  const program = useLiveProgramInfo();
  const insets = useSafeAreaInsets();
  const liveCardBottom = insets.bottom + 76;
  const { isPlaying, isBuffering } = useLiveAudioStatus();

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
          title={program.title}
          subtitle={program.schedule}
          onPressCard={() => {
            router.push('/live-player');
          }}
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
