import { ThemedText } from '@/components/themed-text';
import { EmissionShowCard } from '@/components/ui/emission-show-card';
import { TopicChip } from '@/components/ui/topic-chip';
import { Palette, Spacing } from '@/constants/theme';
import { useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function EmissionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [filter, setFilter] = React.useState<string>('all');
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);

  const filters = React.useMemo(
    () => [
      { key: 'all', label: t('emissions.all') },
      ...shows.map((item) => ({
        key: item.slug,
        label: item.title,
      })),
    ],
    [shows, t]
  );

  const filtered = React.useMemo(
    () => (filter === 'all' ? shows : shows.filter((item) => item.slug === filter)),
    [filter, shows]
  );
  const activeEmission = filter === 'all' ? null : filtered[0] ?? null;

  const handleRefresh = React.useCallback(() => {
    void showsQuery.refetch();
  }, [showsQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={showsQuery.isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
        }>
        <View style={styles.pageTitle}>
          <ThemedText style={styles.heading}>{t('emissions.title')}</ThemedText>
          <ThemedText style={[styles.subheading, { color: theme.homeSubtitle }]}>{t('emissions.subtitle')}</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => (
            <TopicChip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              onPress={() => setFilter(item.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.cards}>
          {showsQuery.isLoading ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>{t('emissions.loading')}</ThemedText>
            </View>
          ) : showsQuery.isError ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {t('emissions.error')}
              </ThemedText>
            </View>
          ) : filtered.length > 0 ? (
            filtered.map((emission) => (
              <EmissionShowCard
                key={emission.slug}
                title={emission.title}
                host={emission.host}
                imageSource={emission.imageSource}
                onPress={() => router.push(`/emissions/${emission.slug}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {t('emissions.empty')}
              </ThemedText>
            </View>
          )}
        </View>

        {activeEmission ? (
          <View style={styles.episodes}>
            <ThemedText style={styles.sectionTitle}>{t('emissions.about')}</ThemedText>
            <View style={styles.highlight}>
              <ThemedText style={styles.highlightTitle}>{activeEmission.title}</ThemedText>
              <ThemedText style={[styles.highlightHost, { color: theme.homeSubtitle }]}>
                {t('emissions.withHost', { host: activeEmission.host })}
              </ThemedText>
              <ThemedText style={[styles.highlightDescription, { color: theme.homeSubtitle }]}>
                {activeEmission.description || t('emissions.noDescription')}
              </ThemedText>
            </View>
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
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  highlightTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  highlightHost: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  highlightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
