import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { ACTUALITES_CATEGORIES, ACTUALITES_ITEMS, type ActualiteCategoryKey } from '@/constants/actualites';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ALL_CATEGORY: ActualiteCategoryKey = 'all';

export default function ActualitesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [category, setCategory] = React.useState<ActualiteCategoryKey>(ALL_CATEGORY);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>(() =>
    ACTUALITES_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.slug] = item.saved;
      return acc;
    }, {})
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    return ACTUALITES_ITEMS.filter((item) => {
      const matchesCategory = category === ALL_CATEGORY || item.category === category;
      const matchesQuery = normalizedQuery.length === 0 || item.title.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, normalizedQuery]);

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
        centerContent={<ThemedText style={styles.headerTitle}>Actualités</ThemedText>}
      />

      {searchOpen ? (
        <View style={styles.searchArea}>
          <View style={styles.searchInputWrap}>
            <MagnifyingGlass size={18} weight="bold" color={Palette.neutral['400']} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une actualité"
              placeholderTextColor={Palette.neutral['400']}
              autoFocus
              selectionColor={Palette.blue['800']}
              style={styles.searchInput}
            />
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {ACTUALITES_CATEGORIES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setCategory(item.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: category === item.key ? theme.primary : theme.homeChipBorder,
                  backgroundColor: category === item.key ? theme.primary : theme.homeChipBackground,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.chipText, { color: category === item.key ? theme.onPrimary : theme.homeChipText }]}>
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.list, { borderTopColor: theme.homeChipBorder }]}>
          {filteredItems.map((item, index) => (
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
          ))}
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
  chip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  list: {
    borderTopWidth: 1,
  },
  pressed: {
    opacity: 0.82,
  },
});
