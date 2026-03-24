import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { Palette } from '@/constants/theme';
import { usePosts } from '@/features/content/infrastructure/fetch-posts';
import { useTheme } from '@/hooks/use-theme';

export default function ActualitesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});
  const postsQuery = usePosts();
  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);

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
    if (normalizedQuery.length === 0) {
      return posts;
    }

    return posts.filter((item) => item.searchText.includes(normalizedQuery));
  }, [normalizedQuery, posts]);

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
    void postsQuery.refetch();
  }, [postsQuery]);

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
          onPress: () => setSearchOpen((current) => !current),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Actualites</ThemedText>}
      />

      {searchOpen ? (
        <View style={styles.searchArea}>
          <View style={styles.searchInputWrap}>
            <MagnifyingGlass size={18} weight="bold" color={Palette.neutral['400']} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une actualite"
              placeholderTextColor={Palette.neutral['400']}
              autoFocus
              selectionColor={Palette.blue['800']}
              style={styles.searchInput}
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={postsQuery.isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
        }>
        <View style={[styles.list, { borderTopColor: theme.homeChipBorder }]}>
          {postsQuery.isLoading ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>Chargement des actualites...</ThemedText>
            </View>
          ) : postsQuery.isError ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                Impossible de charger les actualites.
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
                {normalizedQuery.length > 0 ? 'Aucune actualite ne correspond a votre recherche.' : 'Aucune actualite disponible.'}
              </ThemedText>
            </View>
          )}
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
    lineHeight: 24,
    fontWeight: 700,
  },
  searchArea: {
    backgroundColor: Palette.blue['800'],
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchInputWrap: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: Palette.neutral['100'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: Palette.neutral['800'],
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
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
});
