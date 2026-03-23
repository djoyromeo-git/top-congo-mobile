import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { MediaControls } from '@/components/ui/media-controls';
import { ACTUALITES_ITEMS, findActualite, getRelatedActualites } from '@/constants/actualites';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function ActualiteMediaScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const item = React.useMemo(() => findActualite(slug), [slug]);
  const relatedItems = React.useMemo(() => (item ? getRelatedActualites(item.relatedSlugs) : []), [item]);
  const [mediaMode, setMediaMode] = React.useState<'video' | 'audio'>('video');
  const [muted, setMuted] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>(() =>
    ACTUALITES_ITEMS.reduce<Record<string, boolean>>((acc, entry) => {
      acc[entry.slug] = entry.saved;
      return acc;
    }, {})
  );

  React.useEffect(() => {
    if (!item || item.kind !== 'media') {
      router.replace('/actualites' as never);
    }
  }, [item, router]);

  const toggleSaved = React.useCallback((entrySlug: string) => {
    setSavedMap((current) => ({ ...current, [entrySlug]: !current[entrySlug] }));
  }, []);

  const openItem = React.useCallback(
    (entrySlug: string) => {
      const entry = ACTUALITES_ITEMS.find((candidate) => candidate.slug === entrySlug);
      if (!entry) return;

      router.push((entry.kind === 'media' ? `/actualites/media/${entrySlug}` : `/actualites/${entrySlug}`) as never);
    },
    [router]
  );

  if (!item || item.kind !== 'media') {
    return null;
  }

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
          onPress: () => router.push('/actualites' as never),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Actualités</ThemedText>}
      />

      <View style={styles.toggleWrap}>
        <View style={styles.playerTabs}>
          <Pressable
            onPress={() => setMediaMode('video')}
            style={({ pressed }) => [
              styles.modeButton,
              mediaMode === 'video' ? styles.modeButtonActive : styles.modeButtonInactive,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.modeText, mediaMode === 'video' ? styles.modeTextActive : styles.modeTextInactive]}>
              Vidéo
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setMediaMode('audio')}
            style={({ pressed }) => [
              styles.modeButton,
              mediaMode === 'audio' ? styles.modeButtonActive : styles.modeButtonInactive,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.modeText, mediaMode === 'audio' ? styles.modeTextActive : styles.modeTextInactive]}>
              Audio
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={item.imageSource} style={styles.heroImage} contentFit="cover" transition={0} />
          <View style={styles.heroOverlay} />

          <View style={styles.heroControls}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: mediaMode === 'video' ? '48%' : '42%' }]} />
            </View>

            <MediaControls
              playing={playing}
              muted={muted}
              onTogglePlay={() => setPlaying((current) => !current)}
              onToggleMute={() => setMuted((current) => !current)}
              expanded={false}
              timeLabel={item.duration || '04:39:20'}
              showExpand
            />
          </View>
        </View>

        <View style={styles.body}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={[styles.meta, { color: theme.homeSubtitle }]}>
            {`${item.sectionLabel.toUpperCase()} • ${item.date.toUpperCase()}`}
          </ThemedText>

          <View style={styles.authorCard}>
            <Image source={item.imageSource} style={styles.authorAvatar} contentFit="cover" transition={0} />
            <View style={styles.authorTextWrap}>
              <ThemedText style={styles.authorName}>{item.authorName.toUpperCase()}</ThemedText>
              <ThemedText style={styles.authorRole}>{item.authorRole}</ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.paragraph, { color: theme.homeSubtitle }]}>{item.summary}</ThemedText>
          {item.paragraphs.map((paragraph) => (
            <ThemedText key={paragraph} style={[styles.paragraph, { color: theme.homeSubtitle }]}>
              {paragraph}
            </ThemedText>
          ))}
        </View>

        <View style={styles.relatedSection}>
          <ThemedText style={styles.relatedTitle}>À découvrir aussi</ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.homeChipBorder }]} />

          {relatedItems.map((related, index) => (
            <ActualiteListItem
              key={related.slug}
              title={related.title}
              imageSource={related.imageSource}
              date={related.date}
              saved={savedMap[related.slug]}
              duration={related.duration}
              showPlayBadge={related.kind === 'media'}
              showVerifiedBadge={related.verified}
              showDivider={index < relatedItems.length - 1}
              onPress={() => openItem(related.slug)}
              onPressSave={() => toggleSaved(related.slug)}
            />
          ))}
        </View>

        <View style={{ height: liveCardBottom + 88 }} />
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={"Suivez l'info en direct\nsur Top Congo"}
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
  screen: {
    flex: 1,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  toggleWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    backgroundColor: Palette.blue['800'],
  },
  playerTabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#4968AB',
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
  modeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  modeTextActive: {
    color: Palette.blue['800'],
  },
  modeTextInactive: {
    color: Palette.neutral['100'],
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    height: 212,
    position: 'relative',
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 30, 86, 0.34)',
  },
  heroControls: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.two,
    gap: Spacing.one,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.36)',
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
    fontWeight: 700,
    color: Palette.neutral['800'],
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: 500,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E7F0FF',
    borderRadius: 8,
    padding: 10,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  authorTextWrap: {
    flex: 1,
  },
  authorName: {
    color: Palette.blue['800'],
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
  },
  authorRole: {
    color: Palette.neutral['800'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
  },
  relatedSection: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  relatedTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
    color: Palette.neutral['800'],
  },
  divider: {
    height: 1,
    marginTop: 14,
    marginBottom: 2,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.82,
  },
});
