import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { NewsListItem } from '@/components/ui/news-list-item';
import { TopicChip } from '@/components/ui/topic-chip';
import { Emission, findEmission } from '@/constants/emissions';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'episodes' | 'about' | 'program';

export default function EmissionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();

  const emission = React.useMemo<Emission | undefined>(() => findEmission(slug), [slug]);
  const [tab, setTab] = React.useState<TabKey>('episodes');

  React.useEffect(() => {
    if (!emission) {
      router.replace('/(tabs)/emissions');
    }
  }, [emission, router]);

  if (!emission) {
    return null;
  }

  const heroEpisode = emission.episodes[0];
  // No bottom tab bar on this stack screen, so give the live card a larger offset.
  const liveCardBottom = insets.bottom + 20;

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
          <View style={styles.heroText}>
            <ThemedText style={styles.heroTitle}>{emission.title}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>Avec {emission.host}</ThemedText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <TopicChip label="Episodes" selected={tab === 'episodes'} onPress={() => setTab('episodes')} />
          <TopicChip label="À propos" selected={tab === 'about'} onPress={() => setTab('about')} />
          <TopicChip label="Programme" selected={tab === 'program'} onPress={() => setTab('program')} />
        </ScrollView>

        {tab === 'episodes' ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Dernier épisode</ThemedText>
            <View style={styles.episodeHighlight}>
              <NewsListItem
                title={heroEpisode.title}
                imageSource={heroEpisode.imageSource}
                saved={false}
                date={heroEpisode.date}
                hasBadge
                onPress={() => router.push(`/emissions/${emission.slug}/${heroEpisode.id}`)}
                showDivider={false}
              />
            </View>

            <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.two }]}>Episodes récents</ThemedText>
            {emission.episodes.slice(1).map((ep) => (
              <NewsListItem
                key={ep.id}
                title={ep.title}
                imageSource={ep.imageSource}
                saved={false}
                hasBadge
                date={ep.date}
                onPress={() => router.push(`/emissions/${emission.slug}/${ep.id}`)}
                showDivider
              />
            ))}
          </View>
        ) : null}

        {tab === 'about' ? (
          <View style={styles.section}>
            <View style={styles.hostCard}>
              <Image source={emission.imageSource} style={styles.hostAvatar} contentFit="cover" transition={0} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.hostName}>{emission.host}</ThemedText>
                <ThemedText style={[styles.hostRole, { color: theme.homeSubtitle }]}>Animateur</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.sectionTitle}>À propos de l’émission</ThemedText>
            <ThemedText style={[styles.paragraph, { color: theme.homeSubtitle }]}>{emission.summary}</ThemedText>
          </View>
        ) : null}

        {tab === 'program' ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Programme de diffusion</ThemedText>
            <View style={styles.scheduleList}>
              {emission.schedule.map((item) => (
                <View key={item.day} style={[styles.scheduleRow, { borderColor: theme.homeChipBorder }]}>
                  <ThemedText style={styles.scheduleDay}>{item.day}</ThemedText>
                  <View style={styles.scheduleMeta}>
                    <ThemedText style={styles.scheduleLabel}>{item.label}</ThemedText>
                    <ThemedText style={[styles.scheduleTime, { color: theme.homeTitle }]}>{item.time}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

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
  screen: {
    flex: 1,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    height: 240,
    position: 'relative',
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,65,151,0.45)',
  },
  heroText: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
  },
  heroTitle: {
    color: Palette.neutral['100'],
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '400',
  },
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  section: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
    marginBottom: Spacing.one,
  },
  episodeHighlight: {
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#EAF2FF',
    padding: Spacing.two,
    borderRadius: 10,
    marginBottom: Spacing.two,
  },
  hostAvatar: {
    width: 54,
    height: 54,
    borderRadius: 10,
  },
  hostName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  hostRole: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleList: {
    gap: Spacing.one,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.two,
  },
  scheduleDay: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: Palette.neutral['500'],
  },
  scheduleMeta: {
    gap: 4,
    alignItems: 'flex-end',
  },
  scheduleLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  scheduleTime: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
