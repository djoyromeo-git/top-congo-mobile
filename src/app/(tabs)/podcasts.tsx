import { useRouter } from 'expo-router';
import { ArrowLeft, BookmarkSimple, MagnifyingGlass, Play } from 'phosphor-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { SavedForLaterActiveIcon } from '@/components/ui/saved-for-later-active-icon';
import { TopicChip } from '@/components/ui/topic-chip';
import { Palette, Spacing } from '@/constants/theme';
import {
  type PodcastLibraryItem,
  type PodcastTopicKey,
  selectPodcastDebateMagazine,
  selectPodcastItemsByTopic,
  selectPodcastLatest,
  selectPodcastLibrary,
  selectPodcastSpecialEdition,
  selectPodcastSpotlight,
} from '@/features/emissions/application/select-podcast-library';
import { useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

const PODCAST_FILTERS: { key: PodcastTopicKey; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'politique', label: 'Politique' },
  { key: 'economie', label: 'Economie' },
  { key: 'securite', label: 'Securite' },
  { key: 'societe', label: 'Societe' },
];

export default function PodcastsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const showsQuery = useEmissionShows();
  const items = React.useMemo(() => selectPodcastLibrary(showsQuery.data ?? []), [showsQuery.data]);
  const [selectedTopic, setSelectedTopic] = React.useState<PodcastTopicKey>('all');
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (items.length === 0) {
      return;
    }

    setSavedMap((current) => {
      const next = { ...current };

      for (const item of items) {
        if (!(item.key in next)) {
          next[item.key] = false;
        }
      }

      return next;
    });
  }, [items]);

  const filteredItems = React.useMemo(
    () => selectPodcastItemsByTopic(items, selectedTopic),
    [items, selectedTopic]
  );
  const spotlightItems = React.useMemo(() => selectPodcastSpotlight(filteredItems), [filteredItems]);
  const latestItems = React.useMemo(() => selectPodcastLatest(filteredItems), [filteredItems]);
  const specialItems = React.useMemo(() => selectPodcastSpecialEdition(filteredItems), [filteredItems]);
  const debateItems = React.useMemo(() => selectPodcastDebateMagazine(filteredItems), [filteredItems]);

  const toggleSaved = React.useCallback((key: string) => {
    setSavedMap((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const openItem = React.useCallback(
    (item: PodcastLibraryItem) => {
      router.push(`/podcasts/${item.showSlug}/${item.episodeId}` as never);
    },
    [router]
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.replace('/(tabs)' as never),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search' as never),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Podcast</ThemedText>}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={showsQuery.isRefetching} onRefresh={() => void showsQuery.refetch()} tintColor={theme.primary} />
        }>
        <View>
          <ThemedText style={styles.pageTitle}>Ecoutez quand vous voulez</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: theme.homeSubtitle }]}>
            Nos contenus, a ecouter a tout moment.
          </ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {PODCAST_FILTERS.map((item) => (
            <TopicChip
              key={item.key}
              label={item.label}
              selected={selectedTopic === item.key}
              onPress={() => setSelectedTopic(item.key)}
            />
          ))}
        </ScrollView>

        {showsQuery.isLoading ? <ScreenMessage message="Chargement des podcasts..." /> : null}
        {showsQuery.isError ? <ScreenMessage message="Impossible de charger les podcasts." /> : null}
        {!showsQuery.isLoading && !showsQuery.isError && filteredItems.length === 0 ? (
          <ScreenMessage message="Aucun podcast disponible pour cette selection." />
        ) : null}

        {!showsQuery.isLoading && !showsQuery.isError && filteredItems.length > 0 ? (
          <>
            <SectionHeader title="Les plus ecoutes" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
              {spotlightItems.map((item) => (
                <PodcastFeaturedCard
                  key={`spotlight-${item.key}`}
                  item={item}
                  saved={savedMap[item.key] ?? false}
                  onPress={() => openItem(item)}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
            </ScrollView>

            <SectionHeader title="Les nouveautes" />
            <View style={[styles.listWrap, { borderTopColor: theme.homeChipBorder }]}>
              {latestItems.map((item, index) => (
                <PodcastListItem
                  key={`latest-${item.key}`}
                  item={item}
                  saved={savedMap[item.key] ?? false}
                  showDivider={index < latestItems.length - 1}
                  onPress={() => openItem(item)}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
            </View>

            <SectionHeader title="Edition speciale" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
              {specialItems.map((item) => (
                <PodcastFeaturedCard
                  key={`special-${item.key}`}
                  item={item}
                  saved={savedMap[item.key] ?? false}
                  onPress={() => openItem(item)}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
            </ScrollView>

            <SectionHeader title="Magazine Le Debat" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
              {debateItems.map((item) => (
                <PodcastFeaturedCard
                  key={`debat-${item.key}`}
                  item={item}
                  saved={savedMap[item.key] ?? false}
                  onPress={() => openItem(item)}
                  onPressSave={() => toggleSaved(item.key)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <LiveAudioCard
          loading={false}
          title={"Suivez l'info en direct\nsur Top Congo"}
          subtitle={program.schedule || undefined}
          onPressCard={() => router.push('/direct' as never)}
          onPressPlay={() => router.push('/direct' as never)}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isStarting={isStarting}
          disabled={false}
        />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
    </View>
  );
}

function ScreenMessage({ message }: { message: string }) {
  return (
    <View style={styles.messageWrap}>
      <ThemedText style={styles.messageText}>{message}</ThemedText>
    </View>
  );
}

function PodcastFeaturedCard({
  item,
  saved,
  onPress,
  onPressSave,
}: {
  item: PodcastLibraryItem;
  saved: boolean;
  onPress: () => void;
  onPressSave: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredCard,
        { backgroundColor: theme.headlineCardBackground },
        pressed && styles.pressed,
      ]}>
      <View style={styles.featuredMediaWrap}>
        <ContentImage source={item.imageSource} style={styles.featuredMedia} />
        <View style={styles.featuredBadge}>
          <ThemedText style={styles.featuredBadgeText}>Emission</ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.cardDate, { color: theme.headlineDate }]}>{item.dateLabel}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.featuredTitle}>
        {item.title}
      </ThemedText>

      <Pressable
        onPress={onPressSave}
        style={({ pressed }) => [
          styles.saveButton,
          {
            borderColor: theme.primary,
            backgroundColor: saved ? `${theme.primary}10` : 'transparent',
          },
          pressed && styles.pressed,
        ]}>
        {saved ? (
          <SavedForLaterActiveIcon width={14} height={18} color={theme.primary} />
        ) : (
          <BookmarkSimple size={18} weight="regular" color={theme.primary} />
        )}
        <ThemedText numberOfLines={1} style={[styles.saveLabel, { color: theme.primary }]}>
          {saved ? "Annuler l'enregistrement" : 'Enregistrer pour plus tard'}
        </ThemedText>
      </Pressable>
    </Pressable>
  );
}

function PodcastListItem({
  item,
  saved,
  showDivider,
  onPress,
  onPressSave,
}: {
  item: PodcastLibraryItem;
  saved: boolean;
  showDivider: boolean;
  onPress: () => void;
  onPressSave: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.listRow,
        showDivider && {
          borderBottomWidth: 1,
          borderBottomColor: theme.homeChipBorder,
        },
      ]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.listMain, pressed && styles.pressed]}>
        <View style={styles.listMediaWrap}>
          <ContentImage source={item.imageSource} style={styles.listMedia} />
          <View style={styles.playBadge}>
            <Play size={14} weight="fill" color={theme.primary} />
          </View>
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{item.durationLabel}</ThemedText>
          </View>
          <View style={styles.featuredBadgeSmall}>
            <ThemedText style={styles.featuredBadgeText}>Emission</ThemedText>
          </View>
        </View>

        <View style={styles.listText}>
          <ThemedText style={[styles.cardDate, { color: theme.headlineDate }]}>{item.dateLabel}</ThemedText>
          <ThemedText numberOfLines={3} style={styles.listTitle}>
            {item.title}
          </ThemedText>
        </View>
      </Pressable>

      <Pressable hitSlop={8} onPress={onPressSave} style={({ pressed }) => [styles.listSave, pressed && styles.pressed]}>
        {saved ? (
          <SavedForLaterActiveIcon width={15} height={19} color={theme.primary} />
        ) : (
          <BookmarkSimple size={20} weight="regular" color={theme.primary} />
        )}
      </Pressable>
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
    lineHeight: 22,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 12,
  },
  pageTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  filters: {
    gap: 8,
    paddingVertical: 2,
  },
  sectionHeader: {
    marginTop: 6,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  sectionDivider: {
    height: 1,
  },
  horizontalCards: {
    gap: 12,
    paddingBottom: 4,
  },
  featuredCard: {
    width: 236,
    borderRadius: 12,
    padding: 10,
  },
  featuredMediaWrap: {
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuredMedia: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: Palette.red['800'],
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadgeSmall: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: Palette.red['800'],
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  featuredBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  cardDate: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  featuredTitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  saveButton: {
    marginTop: 14,
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  saveLabel: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '500',
  },
  listWrap: {
    borderTopWidth: 1,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  listMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listMediaWrap: {
    position: 'relative',
  },
  listMedia: {
    width: 136,
    height: 76,
    borderRadius: 6,
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    backgroundColor: Palette.neutral['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: Palette.neutral['100'],
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },
  listText: {
    flex: 1,
    paddingRight: 4,
  },
  listTitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  listSave: {
    width: 26,
    alignItems: 'flex-end',
  },
  messageWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  messageText: {
    color: Palette.neutral['500'],
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.84,
  },
});
