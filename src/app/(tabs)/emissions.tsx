import { ThemedText } from '@/components/themed-text';
import { EmissionShowCard } from '@/components/ui/emission-show-card';
import { NewsListItem } from '@/components/ui/news-list-item';
import { TopicChip } from '@/components/ui/topic-chip';
import { Emission, EMISSION_FILTERS, EMISSIONS } from '@/constants/emissions';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EmissionsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [filter, setFilter] = React.useState<string>('all');

  const filtered: Emission[] =
    filter === 'all' ? EMISSIONS : EMISSIONS.filter((item) => item.slug === filter);
  const activeEmission = filter === 'all' ? null : filtered[0];

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
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
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 140,
    paddingTop: 16,
    gap: 14,
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
});
