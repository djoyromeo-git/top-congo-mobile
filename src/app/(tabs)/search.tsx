import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MagnifyingGlass } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { NewsListItem } from '@/components/ui/news-list-item';
import { selectChipOptions, useCategories } from '@/features/content/infrastructure/fetch-categories';
import { usePosts } from '@/features/content/infrastructure/fetch-posts';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ALL_TOPICS_KEY = 'all';

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string>(ALL_TOPICS_KEY);
  const [savedNews, setSavedNews] = React.useState<Record<string, boolean>>({});
  const topicsQuery = useCategories();
  const postsQuery = usePosts();
  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);

  React.useEffect(() => {
    if (posts.length === 0) {
      return;
    }

    setSavedNews((current) => {
      const next = { ...current };

      for (const post of posts) {
        if (!(post.slug in next)) {
          next[post.slug] = false;
        }
      }

      return next;
    });
  }, [posts]);

  const normalizedQuery = React.useMemo(
    () =>
      query
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim(),
    [query]
  );
  const topicChips = React.useMemo(() => {
    return selectChipOptions(topicsQuery.data ?? [])
      .filter((item) => item.topicKey !== null)
      .map((item) => ({
        key: `api:${item.id}`,
        label: item.label,
        topicKey: item.topicKey,
      }));
  }, [topicsQuery.data]);

  const filteredItems = React.useMemo(() => {
    return posts.filter((item) => {
      const selected = topicChips.find((topic) => topic.key === selectedTopic);
      const matchesTopic = selectedTopic === ALL_TOPICS_KEY || (selected ? item.topicKey === selected.topicKey : false);
      const matchesQuery = normalizedQuery.length === 0 || item.searchText.includes(normalizedQuery);

      return matchesTopic && matchesQuery;
    });
  }, [normalizedQuery, posts, selectedTopic, topicChips]);

  const toggleSaved = React.useCallback((key: string) => {
    setSavedNews((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const openItem = React.useCallback(
    (slug: string) => {
      const item = posts.find((entry) => entry.slug === slug);
      if (!item) {
        return;
      }

      router.push((item.kind === 'media' ? `/actualites/media/${slug}` : `/actualites/${slug}`) as never);
    },
    [posts, router]
  );

  const showResultsState = normalizedQuery.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <StatusBar style="light" backgroundColor={Palette.blue['800']} />

      <AppTopBar
        leftAction={{ icon: 'arrow-left', onPress: () => router.back() }}
        reserveRightSlot={false}
        centerContent={
          <View style={styles.searchInputWrap}>
            <MagnifyingGlass size={20} weight="bold" color={Palette.neutral['100']} />
            <View style={styles.searchDivider} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder')}
              placeholderTextColor="rgba(255,255,255,0.32)"
              autoFocus
              selectionColor={Palette.neutral['100']}
              style={styles.searchInput}
            />
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {showResultsState ? (
          <>
            <ThemedText style={[styles.sectionTitle, { color: theme.homeTitle }]}>
              {t('search.resultsFound', { count: filteredItems.length })}
            </ThemedText>

            <View style={[styles.resultsList, { borderTopColor: theme.homeChipBorder }]}>
              {postsQuery.isLoading ? (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.loadingPosts')}
                  </ThemedText>
                </View>
              ) : postsQuery.isError ? (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.errorPosts')}
                  </ThemedText>
                </View>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <NewsListItem
                    key={item.slug}
                    title={item.title}
                    date={item.publishedAtLabel}
                    imageSource={item.imageSource}
                    saved={savedNews[item.slug] ?? false}
                    hasBadge={item.kind === 'media'}
                    showDivider={index < filteredItems.length - 1}
                    onPress={() => openItem(item.slug)}
                    onPressSave={() => toggleSaved(item.slug)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.noResults')}
                  </ThemedText>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <ThemedText style={[styles.sectionTitle, { color: theme.homeTitle }]}>
              {t('search.recentSection')}
            </ThemedText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TopicChip
                label={t('search.allNews')}
                selected={selectedTopic === ALL_TOPICS_KEY}
                onPress={() => setSelectedTopic(ALL_TOPICS_KEY)}
              />
              {topicChips.map((topic) => (
                <TopicChip
                  key={topic.key}
                  label={topic.label}
                  selected={selectedTopic === topic.key}
                  onPress={() => setSelectedTopic(topic.key)}
                />
              ))}
            </ScrollView>

            <View style={[styles.resultsList, { borderTopColor: theme.homeChipBorder }]}>
              {postsQuery.isLoading ? (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.loadingPosts')}
                  </ThemedText>
                </View>
              ) : postsQuery.isError ? (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.errorPosts')}
                  </ThemedText>
                </View>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <NewsListItem
                    key={item.slug}
                    title={item.title}
                    date={item.publishedAtLabel}
                    imageSource={item.imageSource}
                    saved={savedNews[item.slug] ?? false}
                    hasBadge={item.kind === 'media'}
                    showDivider={index < filteredItems.length - 1}
                    onPress={() => openItem(item.slug)}
                    onPressSave={() => toggleSaved(item.slug)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                    {t('search.emptyAll')}
                  </ThemedText>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function TopicChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.topicChip,
        {
          borderColor: selected ? theme.primary : theme.homeChipBorder,
          backgroundColor: theme.homeChipBackground,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.topicLabel, { color: theme.homeChipText }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchInputWrap: {
    flex: 1,
    minHeight: 42,
    borderRadius: 7,
    backgroundColor: '#11347E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
  },
  emptyState: {
    minHeight: 230,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
    maxWidth: 250,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 18,
  },
  topicChip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topicLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  resultsList: {
    marginTop: 18,
    borderTopWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
