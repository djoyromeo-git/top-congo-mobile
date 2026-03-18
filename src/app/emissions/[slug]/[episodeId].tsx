import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, ArrowsOutSimple, MagnifyingGlass, Play, SpeakerHigh, SpeakerX } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { NewsListItem } from '@/components/ui/news-list-item';
import { Palette, Spacing } from '@/constants/theme';
import { findEmission, findEpisode } from '@/constants/emissions';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function EpisodeDetailScreen() {
  const { slug, episodeId } = useLocalSearchParams<{ slug?: string; episodeId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();

  const emission = React.useMemo(() => findEmission(slug), [slug]);
  const episode = React.useMemo(() => findEpisode(slug, episodeId), [slug, episodeId]);

  React.useEffect(() => {
    if (!emission || !episode) {
      router.replace('/(tabs)/emissions');
    }
  }, [emission, episode, router]);

  if (!emission || !episode) return null;

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
        centerContent={<ThemedText style={styles.headerTitle}>{emission.title}</ThemedText>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={emission.imageSource} style={styles.heroImage} contentFit="cover" transition={0} />
          <View style={styles.heroOverlay} />
          <View style={styles.playerTabs}>
            <ThemedText style={[styles.playerTab, styles.playerTabActive]}>Vidéo</ThemedText>
            <ThemedText style={styles.playerTab}>Audio</ThemedText>
          </View>

          <View style={styles.heroControls}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '48%' }]} />
            </View>
            <View style={styles.controlsRow}>
              <Play size={20} weight="fill" color={Palette.neutral['100']} />
              <ThemedText style={styles.timer}>4:39:20 / 11:12:45</ThemedText>
              <ArrowsOutSimple size={20} weight="bold" color={Palette.neutral['100']} />
              <View style={{ width: Spacing.two }} />
              <SpeakerHigh size={20} weight="bold" color={Palette.neutral['100']} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <ThemedText style={styles.title}>{episode.title}</ThemedText>
          <ThemedText style={[styles.meta, { color: theme.homeSubtitle }]}>{emission.title} • {episode.date}</ThemedText>

          <View style={styles.hostCard}>
            <Image source={emission.imageSource} style={styles.hostAvatar} contentFit="cover" transition={0} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.hostName}>{episode.host}</ThemedText>
              <ThemedText style={[styles.hostRole, { color: theme.homeSubtitle }]}>Animateur</ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.description, { color: theme.homeSubtitle }]}>{episode.description}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Autres épisodes</ThemedText>
          {emission.episodes
            .filter((ep) => ep.id !== episode.id)
            .map((ep) => (
              <NewsListItem
                key={ep.id}
                title={ep.title}
                imageSource={ep.imageSource}
                saved={false}
                hasBadge
                date={ep.date}
                onPress={() => router.replace(`/emissions/${emission.slug}/${ep.id}`)}
                showDivider
              />
            ))}
        </View>

        <View style={styles.liveCard}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerTitle: { color: Palette.neutral['100'], fontSize: 17, fontWeight: '700' },
  content: { paddingBottom: 120 },
  hero: {
    height: 280,
    position: 'relative',
    backgroundColor: Palette.blue['800'],
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(23,65,151,0.55)' },
  playerTabs: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    padding: Spacing.one,
  },
  playerTab: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 18,
    color: Palette.neutral['100'],
    fontWeight: '600',
  },
  playerTabActive: {
    backgroundColor: Palette.neutral['100'],
    color: Palette.blue['800'],
  },
  heroControls: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.three,
    right: Spacing.three,
    gap: Spacing.one,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.red['800'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timer: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Palette.neutral['100'],
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#EAF2FF',
    padding: Spacing.two,
    borderRadius: 10,
  },
  hostAvatar: { width: 54, height: 54, borderRadius: 10 },
  hostName: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  hostRole: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  description: { fontSize: 14, lineHeight: 20 },
  section: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  sectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: Palette.neutral['800'] },
  liveCard: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.four },
});
