import React from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { EmissionShowCard } from '@/components/ui/emission-show-card';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { NewsListItem } from '@/components/ui/news-list-item';
import { TopicChip } from '@/components/ui/topic-chip';
import { Palette, Spacing } from '@/constants/theme';
import { EMISSION_FILTERS, EMISSIONS, Emission } from '@/constants/emissions';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function EmissionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();

  const [filter, setFilter] = React.useState<string>('all');

  const filtered: Emission[] =
    filter === 'all' ? EMISSIONS : EMISSIONS.filter((item) => item.slug === filter);
  const activeEmission = filter === 'all' ? null : filtered[0];

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{ icon: 'arrow-left', onPress: handleBack }}
        rightAction={{ icon: 'search', onPress: () => router.push('/search') }}
        centerContent={<ThemedText style={styles.headerTitle}>Emissions</ThemedText>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageTitle}>
          <ThemedText style={styles.heading}>Retrouvez nos émissions</ThemedText>
          <ThemedText style={[styles.subheading, { color: theme.homeSubtitle }]}>En direct ou en replay</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {EMISSION_FILTERS.map((item) => (
            <TopicChip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              onPress={() => setFilter(item.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.cards}>
          {filtered.map((emission) => (
            <EmissionShowCard
              key={emission.slug}
              title={emission.title}
              host={emission.host}
              imageSource={emission.imageSource}
              onPress={() => router.push(`/emissions/${emission.slug}`)}
            />
          ))}
        </View>

        {activeEmission ? (
          <View style={styles.episodes}>
            <ThemedText style={styles.sectionTitle}>Dernier épisode</ThemedText>
            <View style={styles.highlight}>
              <NewsListItem
                title={activeEmission.episodes[0].title}
                imageSource={activeEmission.episodes[0].imageSource}
                saved={false}
                hasBadge
                date={activeEmission.episodes[0].date}
                onPress={() => router.push(`/emissions/${activeEmission.slug}/${activeEmission.episodes[0].id}`)}
              />
            </View>

            <ThemedText style={styles.sectionTitle}>Autres éditions</ThemedText>
            {activeEmission.episodes.slice(1).map((ep) => (
              <NewsListItem
                key={ep.id}
                title={ep.title}
                imageSource={ep.imageSource}
                saved={false}
                hasBadge
                date={ep.date}
                showDivider
                onPress={() => router.push(`/emissions/${activeEmission.slug}/${ep.id}`)}
              />
            ))}
          </View>
        ) : null}

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
  screen: {
    flex: 1,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 120,
    gap: Spacing.three,
  },
  pageTitle: {
    paddingHorizontal: 2,
    gap: 4,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  subheading: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  filters: {
    paddingVertical: Spacing.one,
    gap: Spacing.two,
    paddingHorizontal: 2,
  },
  cards: {
    gap: Spacing.two,
  },
  episodes: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
    paddingHorizontal: 2,
    marginTop: Spacing.one,
  },
  highlight: {
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  liveCard: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
