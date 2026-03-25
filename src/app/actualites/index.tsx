import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { useHomeLoading } from '@/components/ui/home-loading-context';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette } from '@/constants/theme';
import { selectChipOptions, useCategories } from '@/features/content/infrastructure/fetch-categories';
import { usePosts } from '@/features/content/infrastructure/fetch-posts';
import { useTheme } from '@/hooks/use-theme';
import { requestDirectMode } from '@/services/direct-mode-intent';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function ActualitesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isHomeLoading = useHomeLoading();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});
  const postsQuery = usePosts();
  const categoriesQuery = useCategories();
  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const liveCardBottom = insets.bottom + 16;
  const categoryChips = React.useMemo(
    () =>
      selectChipOptions(categoriesQuery.data ?? [])
        .filter((item) => item.topicKey !== null)
        .map((item) => ({
          key: `api:${item.id}`,
          label: item.label,
          topicKey: item.topicKey,
        })),
    [categoriesQuery.data]
  );

  React.useEffect(() => {
    if (posts.length === 0) {
      return;
    }

    setSavedMap((current) => {
      const next = { ...current };

      for (const post of posts) {
        if (!(post.slug in next)) {
          next[post.slug] = false;
        }
      }

      return next;
    });
  }, [posts]);

  const filteredItems = React.useMemo(() => {
    return selectedCategory === 'all'
      ? posts
      : posts.filter((item) => {
          const selected = categoryChips.find((category) => category.key === selectedCategory);
          return selected ? item.topicKey === selected.topicKey : false;
        });
  }, [categoryChips, posts, selectedCategory]);

  const toggleSaved = React.useCallback((slug: string) => {
    setSavedMap((current) => ({ ...current, [slug]: !current[slug] }));
  }, []);

  const openItem = React.useCallback(
    (slug: string) => {
      const item = posts.find((entry) => entry.slug === slug);
      if (!item) return;

      router.push((item.kind === 'media' ? `/actualites/media/${slug}` : `/actualites/${slug}`) as never);
    },
    [posts, router]
  );

  const handleRefresh = React.useCallback(() => {
    void Promise.all([postsQuery.refetch(), categoriesQuery.refetch()]);
  }, [categoriesQuery, postsQuery]);

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
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <StatusBar style="light" backgroundColor={Palette.blue['800']} />

      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search'),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>{t('actualites.title')}</ThemedText>}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={postsQuery.isRefetching || categoriesQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }>
        {categoryChips.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            <Pressable
              onPress={() => setSelectedCategory('all')}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  borderColor: selectedCategory === 'all' ? theme.primary : theme.homeChipBorder,
                  backgroundColor: selectedCategory === 'all' ? theme.primary : theme.homeChipBackground,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === 'all' ? theme.onPrimary : theme.homeChipText },
                ]}>
                {t('actualites.all')}
              </ThemedText>
            </Pressable>

            {categoryChips.map((category) => {
              const isSelected = category.key === selectedCategory;

              return (
                <Pressable
                  key={category.key}
                  onPress={() => setSelectedCategory(category.key)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      borderColor: isSelected ? theme.primary : theme.homeChipBorder,
                      backgroundColor: isSelected ? theme.primary : theme.homeChipBackground,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={[styles.categoryChipText, { color: isSelected ? theme.onPrimary : theme.homeChipText }]}>
                    {category.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={[styles.list, { borderTopColor: theme.homeChipBorder }]}>
          {postsQuery.isLoading ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>{t('actualites.loading')}</ThemedText>
            </View>
          ) : postsQuery.isError ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {t('actualites.error')}
              </ThemedText>
            </View>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ActualiteListItem
                key={item.slug}
                title={item.title}
                imageSource={item.imageSource}
                date={item.publishedAtLabel}
                saved={savedMap[item.slug] ?? false}
                duration={item.kind === 'media' ? item.readingTimeLabel ?? undefined : undefined}
                showPlayBadge={item.kind === 'media'}
                showVerifiedBadge={item.isFeatured}
                showDivider={index < filteredItems.length - 1}
                onPress={() => openItem(item.slug)}
                onPressSave={() => toggleSaved(item.slug)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {selectedCategory === 'all' ? t('actualites.emptyAll') : t('actualites.emptyCategory')}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={isHomeLoading}
          title={program.title}
          subtitle={program.schedule || undefined}
          onPressCard={() => {
            requestDirectMode('audio');
            router.push('/direct');
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
  screen: {
    flex: 1,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryChip: {
    minHeight: 37,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  categoryChipText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  list: {
    borderTopWidth: 1,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
