import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette, Spacing } from '@/constants/theme';
import { findEmissionShow, useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EpisodeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string; episodeId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);
  const emission = React.useMemo(() => findEmissionShow(shows, slug), [shows, slug]);

  React.useEffect(() => {
    if (!showsQuery.isSuccess) {
      return;
    }

    if (emission) {
      router.replace(`/emissions/${emission.slug}` as never);
      return;
    }

    router.replace('/(tabs)/emissions');
  }, [emission, router, showsQuery.isSuccess]);

  const liveCardBottom = insets.bottom + 10;

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search'),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>{emission?.title ?? 'Emission'}</ThemedText>}
      />

      <View style={styles.content}>
        <View style={styles.messageWrap}>
          <ThemedText style={styles.title}>Episodes indisponibles</ThemedText>
          <ThemedText style={[styles.description, { color: theme.homeSubtitle }]}>
            Les donnees de replay ou d&apos;episode ne sont pas encore fournies par l&apos;endpoint `/shows`.
          </ThemedText>
        </View>
        <View style={{ height: liveCardBottom + 32 }} />
      </View>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={program.title}
          subtitle={program.schedule || undefined}
          onPressCard={() => router.push('/direct')}
          onPressPlay={() => router.push('/direct')}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          disabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerTitle: { color: Palette.neutral['100'], fontSize: 17, fontWeight: '700' },
  content: { flex: 1, paddingBottom: 40 },
  messageWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  liveCardFixed: { position: 'absolute', left: 16, right: 16 },
});
