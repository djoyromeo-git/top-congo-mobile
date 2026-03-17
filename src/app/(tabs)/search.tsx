import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MagnifyingGlass } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { NewsListItem } from '@/components/ui/news-list-item';
import { NEWS_ITEMS, QUICK_TOPICS } from '@/constants/home-feed';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ALL_TOPICS_KEY = 'all';

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string>(ALL_TOPICS_KEY);
  const [savedNews, setSavedNews] = React.useState<Record<string, boolean>>(() =>
    NEWS_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.saved;
      return acc;
    }, {})
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    return NEWS_ITEMS.filter((item) => {
      const matchesTopic = selectedTopic === ALL_TOPICS_KEY || item.topicKey === selectedTopic;
      const title = t(`homeFeed.${item.key}`).toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || title.includes(normalizedQuery);

      return matchesTopic && matchesQuery;
    });
  }, [normalizedQuery, selectedTopic, t]);

  const toggleSaved = React.useCallback((key: string) => {
    setSavedNews((current) => ({ ...current, [key]: !current[key] }));
  }, []);

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
              {filteredItems.map((item, index) => (
                <NewsListItem
                  key={item.key}
                  title={t(`homeFeed.${item.key}`)}
                  imageSource={item.imageSource}
                  saved={savedNews[item.key]}
                  hasBadge={item.hasBadge}
                  showDivider={index < filteredItems.length - 1}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <ThemedText style={[styles.sectionTitle, { color: theme.homeTitle }]}>
              {t('search.recentSection')}
            </ThemedText>

            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: theme.homeSubtitle }]}>
                {t('search.emptyRecent')}
              </ThemedText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TopicChip
                label={t('search.allNews')}
                selected={selectedTopic === ALL_TOPICS_KEY}
                onPress={() => setSelectedTopic(ALL_TOPICS_KEY)}
              />
              {QUICK_TOPICS.map((topic) => (
                <TopicChip
                  key={topic.key}
                  label={`${topic.emoji} ${t(`topics.${topic.key}`)}`}
                  selected={selectedTopic === topic.key}
                  onPress={() => setSelectedTopic(topic.key)}
                />
              ))}
            </ScrollView>

            <View style={[styles.resultsList, { borderTopColor: theme.homeChipBorder }]}>
              {filteredItems.map((item, index) => (
                <NewsListItem
                  key={item.key}
                  title={t(`homeFeed.${item.key}`)}
                  imageSource={item.imageSource}
                  saved={savedNews[item.key]}
                  hasBadge={item.hasBadge}
                  showDivider={index < filteredItems.length - 1}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
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
