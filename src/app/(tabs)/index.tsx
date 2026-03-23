import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BookmarkSimple, SealCheck } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadlineCard } from '@/components/ui/headline-card';
import { useHomeLoading } from '@/components/ui/home-loading-context';
import { NewsListItem } from '@/components/ui/news-list-item';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { TabShell } from '@/components/ui/tab-shell';
import { FEATURED_NEWS, NEWS_ITEMS, PODCASTS, SHOWS } from '@/constants/home-feed';
import { useAuthSession } from '@/features/auth/presentation/use-auth-session';
import { selectTopicChipOptions, useTopicsOptions } from '@/features/topics/infrastructure/fetch-topics-options';
import { useTheme } from '@/hooks/use-theme';

export default function HomeFeedScreen() {
  const isHomeLoading = useHomeLoading();

  return (
    <TabShell>
      {({ liveCardBottom }) => (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 90 }]}
          showsVerticalScrollIndicator={false}>
          {isHomeLoading ? <HomeSkeleton /> : <HomeContent />}
        </ScrollView>
      )}
    </TabShell>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { session } = useAuthSession();
  const [featuredSaved, setFeaturedSaved] = React.useState<Record<string, boolean>>(() =>
    FEATURED_NEWS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.saved;
      return acc;
    }, {})
  );
  const [savedNews, setSavedNews] = React.useState<Record<string, boolean>>(() =>
    NEWS_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.saved;
      return acc;
    }, {})
  );
  const [savedPodcasts, setSavedPodcasts] = React.useState<Record<string, boolean>>(() =>
    PODCASTS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.saved;
      return acc;
    }, {})
  );
  const [selectedTopic, setSelectedTopic] = React.useState<string>('all');
  const topicsQuery = useTopicsOptions();

  const topicChips = React.useMemo(() => {
    return selectTopicChipOptions(topicsQuery.data ?? [])
      .filter((item) => item.topicKey !== null)
      .map((item) => ({
        key: `api:${item.id}`,
        label: item.label,
        topicKey: item.topicKey,
      }));
  }, [topicsQuery.data]);

  const filteredNews = React.useMemo(
    () =>
      selectedTopic === 'all'
        ? NEWS_ITEMS
        : NEWS_ITEMS.filter((item) => {
            const selected = topicChips.find((topic) => topic.key === selectedTopic);
            return selected ? item.topicKey === selected.topicKey : false;
          }),
    [selectedTopic, topicChips]
  );

  const toggleFeaturedSaved = React.useCallback((key: string) => {
    setFeaturedSaved((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const toggleNewsSaved = React.useCallback((key: string) => {
    setSavedNews((current) => ({ ...current, [key]: !current[key] }));
  }, []);
  const togglePodcastSaved = React.useCallback((key: string) => {
    setSavedPodcasts((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const displayName =
    session?.user.fullName?.trim() ||
    session?.user.givenName?.trim() ||
    session?.user.email?.trim() ||
    'Top Congo';
  const isAuthenticated = !!session;

  return (
    <>
      {isAuthenticated ? (
        <View>
          <ThemedText style={[styles.title, { color: theme.homeTitle }]}>
            {t('homeFeed.welcome', { name: displayName })}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.homeSubtitle }]}>
            {t('homeFeed.subtitle')}
          </ThemedText>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
        <Pressable
          onPress={() => setSelectedTopic('all')}
          style={({ pressed }) => [
            styles.topicChip,
            {
              borderColor: selectedTopic === 'all' ? theme.primary : theme.homeChipBorder,
              backgroundColor: selectedTopic === 'all' ? `${theme.primary}` : theme.homeChipBackground,
            },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.topicText, { color: selectedTopic === 'all' ? theme.onPrimary : theme.homeChipText }]}>
            {t('homeFeed.topicAll')}
          </ThemedText>
        </Pressable>

        {topicChips.map((topic) => {
          const isSelected = topic.key === selectedTopic;

          return (
            <Pressable
              key={topic.key}
              onPress={() => setSelectedTopic(topic.key)}
              style={({ pressed }) => [
                styles.topicChip,
                {
                  borderColor: isSelected ? theme.primary : theme.homeChipBorder,
                  backgroundColor: isSelected ? `${theme.primary}` : theme.homeChipBackground,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.topicText, { color: isSelected ? theme.onPrimary : theme.homeChipText }]}>
                {topic.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader title={t('homeFeed.headlineSection')} actionLabel={t('common.learnMore')} />

      <ScrollView
        horizontal
        style={styles.headlinesScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {FEATURED_NEWS.map((item) => {
          const isSaved = featuredSaved[item.key];

          return (
            <HeadlineCard
              key={item.key}
              badge={t(`homeFeed.${item.badgeKey}`)}
              date={t(`homeFeed.${item.dateKey}`)}
              title={t(`homeFeed.${item.titleKey}`)}
              imageSource={item.imageSource}
              fallbackVariant={item.fallbackVariant}
              showBadgeDot={item.showBadgeDot}
              actionLabel={t(isSaved ? 'homeFeed.cancelSaved' : 'homeFeed.saveForLater')}
              actionActive={isSaved}
              onPressAction={() => toggleFeaturedSaved(item.key)}
            />
          );
        })}
      </ScrollView>

      <SectionHeader title={t('homeFeed.showsSection')} actionLabel={t('homeFeed.seeMore')} />

      <ScrollView
        horizontal
        style={styles.showsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {SHOWS.map((item) => (
          <ShowCard
            key={item.key}
            title={t(`homeFeed.${item.titleKey}`)}
            imageSource={item.imageSource}
          />
        ))}
      </ScrollView>

      <SectionHeader title={t('homeFeed.podcastSection')} actionLabel={t('homeFeed.seeMore')} />

      <ScrollView
        horizontal
        style={styles.podcastsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {PODCASTS.map((item) => {
          const isSaved = savedPodcasts[item.key];

          return (
            <HeadlineCard
              key={item.key}
              badge={t(`homeFeed.${item.badgeKey}`)}
              date={t(`homeFeed.${item.dateKey}`)}
              title={t(`homeFeed.${item.titleKey}`)}
              imageSource={item.imageSource}
              fallbackVariant="blue"
              actionLabel={t(isSaved ? 'homeFeed.cancelSaved' : 'homeFeed.saveForLater')}
              actionActive={isSaved}
              onPressAction={() => togglePodcastSaved(item.key)}
            />
          );
        })}
      </ScrollView>

      <SectionHeader
        title={t('homeFeed.newsFeedSection')}
        actionLabel={t('homeFeed.seeMore')}
        onPress={() => router.push('/actualites' as never)}
      />

      <View style={[styles.newsList, { borderTopColor: theme.homeChipBorder }]}>
        {filteredNews.map((item, index) => (
          <NewsListItem
            key={item.key}
            title={t(`homeFeed.${item.key}`)}
            date={t(`homeFeed.${item.dateKey}`)}
            imageSource={item.imageSource}
            saved={savedNews[item.key]}
            hasBadge={item.hasBadge}
            showDivider={index < filteredNews.length - 1}
            onPressSave={() => toggleNewsSaved(item.key)}
          />
        ))}
      </View>
    </>
  );
}

function HomeSkeleton() {
  const theme = useTheme();

  return (
    <>
      <View>
        <SkeletonBlock style={styles.titleSkeleton} />
        <SkeletonBlock style={styles.subtitleSkeleton} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
        {[120, 128, 112, 96].map((width, index) => (
          <View
            key={`topic-skeleton-${index}`}
            style={[
              styles.topicChip,
              {
                width,
                borderColor: theme.homeChipBorder,
                backgroundColor: theme.homeChipBackground,
              },
            ]}>
            <SkeletonBlock style={styles.topicLineSkeleton} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <SkeletonBlock style={styles.sectionTitleSkeleton} />
        <SkeletonBlock style={styles.sectionLinkSkeleton} />
      </View>

      <ScrollView
        horizontal
        style={styles.headlinesScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        <HeadlineCardSkeleton withActiveAction={false} showLiveDot />
        <HeadlineCardSkeleton withActiveAction showLiveDot={false} />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <SkeletonBlock style={styles.sectionTitleSkeleton} />
        <SkeletonBlock style={styles.sectionLinkSkeleton} />
      </View>

      <ScrollView
        horizontal
        style={styles.showsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {[0, 1].map((index) => (
          <SkeletonBlock key={`show-skeleton-${index}`} style={styles.showSkeletonCard} />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <SkeletonBlock style={styles.sectionTitleSkeleton} />
        <SkeletonBlock style={styles.sectionLinkSkeleton} />
      </View>

      <ScrollView
        horizontal
        style={styles.podcastsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        <HeadlineCardSkeleton withActiveAction showLiveDot />
        <HeadlineCardSkeleton withActiveAction showLiveDot />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <SkeletonBlock style={styles.sectionTitleSkeletonAlt} />
        <SkeletonBlock style={styles.sectionLinkSkeleton} />
      </View>

      <View style={[styles.newsList, { borderTopColor: theme.homeChipBorder }]}>
        {NEWS_ITEMS.map((item, index) => (
          <NewsRowSkeleton
            key={`news-skeleton-${item.key}`}
            showBadge={item.hasBadge}
            saved={item.saved}
            showDivider={index < NEWS_ITEMS.length - 1}
          />
        ))}
      </View>
    </>
  );
}

function HeadlineCardSkeleton({
  withActiveAction,
  showLiveDot,
}: {
  withActiveAction: boolean;
  showLiveDot: boolean;
}) {
  const theme = useTheme();

  return (
      <View style={[styles.headlineSkeletonCard, { backgroundColor: theme.headlineCardBackground }]}>
      <View style={[styles.headlineSkeletonMedia, { backgroundColor: theme.homeChipBorder }]}>
        <View style={[styles.headlineSkeletonBadge, { backgroundColor: theme.headlineBadgeBackground }]}>
          {showLiveDot ? <View style={[styles.headlineSkeletonBadgeDot, { backgroundColor: theme.headlineBadgeText }]} /> : null}
          <SkeletonBlock style={styles.headlineSkeletonBadgeText} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.headlineSkeletonCert}>
          <SealCheck size={20} weight="fill" color={theme.headlineAccent} />
        </View>
      </View>

      <SkeletonBlock style={styles.headlineSkeletonDate} />
      <SkeletonBlock style={styles.headlineSkeletonTitleWide} />
      <SkeletonBlock style={styles.headlineSkeletonTitleMedium} />
      <SkeletonBlock style={styles.headlineSkeletonTitleShort} />

      <View
        style={[
          styles.headlineSkeletonAction,
          {
            borderColor: withActiveAction ? theme.primary : theme.border,
            backgroundColor: withActiveAction ? `${theme.primary}14` : 'transparent',
          },
        ]}>
        {withActiveAction ? (
          <BookmarkSimple size={16} weight="fill" color={theme.primary} />
        ) : (
          <BookmarkSimple size={16} weight="regular" color={theme.homeChipBorder} />
        )}
        <SkeletonBlock style={styles.headlineSkeletonActionText} />
      </View>
    </View>
  );
}

function NewsRowSkeleton({
  showBadge,
  saved,
  showDivider,
}: {
  showBadge: boolean;
  saved: boolean;
  showDivider: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.newsRow,
        showDivider && {
          borderBottomColor: theme.homeChipBorder,
          borderBottomWidth: 1,
        },
      ]}>
      <View style={styles.newsMain}>
        <View style={styles.newsMedia}>
          <SkeletonBlock style={styles.newsImage} />
          {showBadge ? (
            <View style={styles.newsBadge}>
              <SealCheck size={18} weight="fill" color={theme.headlineAccent} />
            </View>
          ) : null}
        </View>

        <View style={styles.newsSkeletonTextBlock}>
          <SkeletonBlock style={styles.newsSkeletonLineWide} />
          <SkeletonBlock style={styles.newsSkeletonLineWide} />
          <SkeletonBlock style={styles.newsSkeletonLineShort} />
        </View>
      </View>

      <View style={styles.newsSave}>
        {saved ? (
          <BookmarkSimple size={18} weight="fill" color={theme.primary} />
        ) : (
          <BookmarkSimple size={20} weight="regular" color={theme.homeChipBorder} />
        )}
      </View>
    </View>
  );
}

function ShowCard({ title, imageSource }: { title: string; imageSource?: number }) {
  const theme = useTheme();

  return (
    <Pressable style={({ pressed }) => [styles.showCard, pressed && styles.pressed]}>
      <Image source={imageSource} style={styles.showImage} contentFit="cover" transition={0} />
      <View style={[styles.showOverlay, { backgroundColor: theme.headlineMediaOverlay }]} />
      <ThemedText numberOfLines={2} style={[styles.showTitle, { color: theme.headlineBadgeText }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel: string;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderTop}>
        <ThemedText style={[styles.sectionTitle, { color: theme.homeSectionTitle }]}>{title}</ThemedText>
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText style={[styles.seeMore, { color: theme.primary }]}>{actionLabel}</ThemedText>
        </Pressable>
      </View>
      <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13.2,
    lineHeight: 20,
    fontWeight: 500,
  },
  titleSkeleton: {
    width: '52%',
    height: 16,
    borderRadius: 4,
  },
  subtitleSkeleton: {
    width: '54%',
    height: 12,
    borderRadius: 4,
    marginTop: 14,
  },
  topicsRow: {
    gap: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  topicChip: {
    minHeight: 37,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  topicText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  topicLineSkeleton: {
    width: '72%',
    height: 10,
    borderRadius: 999,
    alignSelf: 'center',
  },
  sectionHeader: {
    marginTop: 6,
    gap: 6,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 32,
    fontWeight: 700,
  },
  seeMore: {
    fontSize: 12.7,
    lineHeight: 20,
    fontWeight: 500,
  },
  sectionTitleSkeleton: {
    width: 88,
    height: 14,
    borderRadius: 4,
  },
  sectionTitleSkeletonAlt: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  sectionLinkSkeleton: {
    width: 54,
    height: 10,
    borderRadius: 4,
  },
  sectionDivider: {
    height: 1,
    borderRadius: 999,
  },
  cardsRow: {
    gap: 12,
    paddingLeft: 16,
    paddingBottom: 2,
  },
  headlinesScroll: {
    marginHorizontal: -16,
  },
  showsScroll: {
    marginHorizontal: -16,
  },
  podcastsScroll: {
    marginHorizontal: -16,
  },
  headlineSkeletonCard: {
    width: 232,
    borderRadius: 12,
    padding: 8,
  },
  headlineSkeletonMedia: {
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
  },
  headlineSkeletonBadge: {
    marginTop: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headlineSkeletonBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  headlineSkeletonBadgeText: {
    width: 26,
    height: 7,
    borderRadius: 999,
  },
  headlineSkeletonCert: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineSkeletonDate: {
    width: 76,
    height: 10,
    borderRadius: 4,
    marginTop: 16,
  },
  headlineSkeletonTitleWide: {
    width: '78%',
    height: 11,
    borderRadius: 4,
    marginTop: 14,
  },
  headlineSkeletonTitleMedium: {
    width: '88%',
    height: 11,
    borderRadius: 4,
    marginTop: 8,
  },
  headlineSkeletonTitleShort: {
    width: '82%',
    height: 11,
    borderRadius: 4,
    marginTop: 8,
  },
  headlineSkeletonAction: {
    marginTop: 18,
    minHeight: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headlineSkeletonActionText: {
    width: '74%',
    height: 10,
    borderRadius: 999,
  },
  showCard: {
    width: 228,
    height: 132,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'flex-end',
    padding: 12,
  },
  showImage: {
    ...StyleSheet.absoluteFillObject,
  },
  showOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  showTitle: {
    fontSize: 16,
    lineHeight: 17,
    fontWeight: 700,
    letterSpacing: 0,
  },
  podcastCard: {
    width: 200,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  newsList: {
    marginTop: 2,
    borderTopWidth: 1,
  },
  showSkeletonCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  podcastSkeletonCard: {
    width: 200,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  newsMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newsMedia: {
    position: 'relative',
  },
  newsImage: {
    width: 124,
    height: 70,
    borderRadius: 6,
  },
  newsBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  newsSave: {
    width: 28,
    alignItems: 'flex-end',
  },
  newsSkeletonTextBlock: {
    flex: 1,
    gap: 8,
  },
  newsSkeletonLineWide: {
    width: '90%',
    height: 10,
    borderRadius: 4,
  },
  newsSkeletonLineShort: {
    width: '74%',
    height: 10,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
