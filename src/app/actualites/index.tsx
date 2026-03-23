import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { TopicChip } from '@/components/ui/topic-chip';
import { ACTUALITES_ITEMS, type ActualiteCategoryKey } from '@/constants/actualites';
import { selectTopicChipOptions, useTopicsOptions } from '@/features/topics/infrastructure/fetch-topics-options';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipSelectionKey = `api:${string}`;

type ResolvedChip = {
  key: ChipSelectionKey;
  label: string;
  filterKey: ActualiteCategoryKey | null;
};

export default function ActualitesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [category, setCategory] = React.useState<ChipSelectionKey | null>(null);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>(() =>
    ACTUALITES_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.slug] = item.saved;
      return acc;
    }, {})
  );
  const topicsQuery = useTopicsOptions();

  const normalizedQuery = query.trim().toLowerCase();

  const chips = React.useMemo<ResolvedChip[]>(() => {
    return selectTopicChipOptions(topicsQuery.data ?? [])
      .map((item) => ({
        key: `api:${item.id}` as const,
        label: item.label,
        filterKey:
          item.topicKey === 'politics' || item.topicKey === 'economy' || item.topicKey === 'security' || item.topicKey === 'sport'
            ? item.topicKey
            : null,
      }))
      .filter((item) => item.filterKey !== null);
  }, [topicsQuery.data]);

  React.useEffect(() => {
    if (chips.length === 0) {
      if (category !== null) {
        setCategory(null);
      }
      return;
    }

    const selectedStillExists = category ? chips.some((item) => item.key === category) : false;
    if (!selectedStillExists) {
      setCategory(chips[0].key);
    }
  }, [category, chips]);

  const activeChip = React.useMemo<ResolvedChip | null>(() => {
    if (!category) {
      return null;
    }

    return chips.find((item) => item.key === category) ?? null;
  }, [category, chips]);

  const filteredItems = React.useMemo(() => {
    return ACTUALITES_ITEMS.filter((item) => {
      const matchesCategory =
        activeChip === null ? true : activeChip.filterKey === null ? false : item.category === activeChip.filterKey;
      const matchesQuery = normalizedQuery.length === 0 || item.title.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeChip, normalizedQuery]);

  const toggleSaved = React.useCallback((slug: string) => {
    setSavedMap((current) => ({ ...current, [slug]: !current[slug] }));
  }, []);

  const openItem = React.useCallback(
    (slug: string) => {
      const item = ACTUALITES_ITEMS.find((entry) => entry.slug === slug);
      if (!item) return;

      router.push((item.kind === 'media' ? `/actualites/media/${slug}` : `/actualites/${slug}`) as never);
    },
    [router]
  );

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {chips.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {chips.map((item) => (
              <TopicChip
                key={item.key}
                label={item.label}
                selected={category === item.key}
                onPress={() => setCategory(item.key)}
              />
            ))}
          </ScrollView>
        ) : topicsQuery.isLoading ? (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
              Chargement des categories...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
              Aucune categorie disponible.
            </ThemedText>
          </View>
        )}

        <View style={[styles.list, { borderTopColor: theme.homeChipBorder }]}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ActualiteListItem
                key={item.slug}
                title={item.title}
                imageSource={item.imageSource}
                date={item.date}
                saved={savedMap[item.slug]}
                duration={item.duration}
                showPlayBadge={item.kind === 'media'}
                showVerifiedBadge={item.verified}
                showDivider={index < filteredItems.length - 1}
                onPress={() => openItem(item.slug)}
                onPressSave={() => toggleSaved(item.slug)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {activeChip ? 'Aucune actualite pour ce theme.' : 'Aucune actualite disponible.'}
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
  chipsRow: {
    gap: 8,
    paddingBottom: 18,
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
