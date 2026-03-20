import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowsOutSimple, MagnifyingGlass, Play, SpeakerHigh } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { MediaControls } from '@/components/ui/media-controls';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { NewsListItem } from '@/components/ui/news-list-item';
import { findEmission, findEpisode } from '@/constants/emissions';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EpisodeDetailScreen() {
  const { slug, episodeId } = useLocalSearchParams<{ slug?: string; episodeId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const [mediaMode, setMediaMode] = React.useState<'video' | 'audio'>('video');
  const [isMuted, setIsMuted] = React.useState(false);

  const emission = React.useMemo(() => findEmission(slug), [slug]);
  const episode = React.useMemo(() => findEpisode(slug, episodeId), [slug, episodeId]);

  React.useEffect(() => {
    if (!emission || !episode) {
      router.replace('/(tabs)/emissions');
    }
  }, [emission, episode, router]);

  if (!emission || !episode) return null;

  // No bottom tab bar on this stack screen, so give the live card a larger offset.
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
        centerContent={<ThemedText style={styles.headerTitle}>{emission.title}</ThemedText>}
      />

      <View style={styles.fixedToggle}>
        <View style={styles.playerTabs}>
          <Pressable
            style={[styles.modeButton, mediaMode === 'video' ? styles.modeButtonActive : styles.modeButtonInactive]}
            onPress={() => setMediaMode('video')}>
            <ThemedText
              style={[
                styles.modeButtonText,
                mediaMode === 'video' ? styles.modeButtonTextActive : styles.modeButtonTextInactive,
              ]}>
              Vidéo
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mediaMode === 'audio' ? styles.modeButtonActive : styles.modeButtonInactive]}
            onPress={() => setMediaMode('audio')}>
            <ThemedText
              style={[
                styles.modeButtonText,
                mediaMode === 'audio' ? styles.modeButtonTextActive : styles.modeButtonTextInactive,
              ]}>
              Audio
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={emission.imageSource} style={styles.heroImage} contentFit="cover" transition={0} />
          <View style={styles.heroOverlay} />

          <View style={styles.heroControls}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '48%' }]} />
            </View>
            <MediaControls
              playing={isPlaying}
              muted={isMuted}
              onTogglePlay={() => {}}
              onToggleMute={() => setIsMuted((m) => !m)}
              expanded={false}
              timeLabel="4:39:20 / 11:12:45"
              showExpand={false}
            />
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

        <View style={{ height: liveCardBottom + 32 }} />
      </ScrollView>

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
  content: { paddingBottom: 40 },
  fixedToggle: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    backgroundColor: Palette.blue['800'],
  },
  playerTabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Palette.blue['600'],
    borderRadius: 8,
    padding: 6,
  },
  modeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modeButtonActive: {
    backgroundColor: Palette.neutral['100'],
  },
  modeButtonInactive: {
    backgroundColor: 'transparent',
  },
  modeButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  modeButtonTextActive: {
    color: Palette.blue['800'],
  },
  modeButtonTextInactive: {
    color: Palette.neutral['100'],
  },
  hero: {
    height: 212,
    position: 'relative',
    backgroundColor: Palette.blue['800'],
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(23,65,151,0.55)' },
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
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  liveCardFixed: { position: 'absolute', left: 16, right: 16 },
});
