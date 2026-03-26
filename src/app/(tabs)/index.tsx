import { useRouter } from 'expo-router';
import { BookmarkSimple, SealCheck } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ContentImage } from '@/components/ui/content-image';
import { HeadlineCard } from '@/components/ui/headline-card';
import { useHomeLoading } from '@/components/ui/home-loading-context';
import { NewsListItem } from '@/components/ui/news-list-item';
import { SavedForLaterActiveIcon } from '@/components/ui/saved-for-later-active-icon';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { TabShell } from '@/components/ui/tab-shell';
import { NEWS_ITEMS, PODCASTS, SHOWS } from '@/constants/home-feed';
import { useAuthSession } from '@/features/auth/presentation/use-auth-session';
import { type Post, usePosts } from '@/features/content/infrastructure/fetch-posts';
import { type EmissionShow, useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { selectTopicChipOptions, useTopicsOptions } from '@/features/topics/infrastructure/fetch-topics-options';
import { useTheme } from '@/hooks/use-theme';

export default function HomeFeedScreen() {
  const isHomeLoading = useHomeLoading();
  const theme = useTheme();
  const postsQuery = usePosts();
  const showsQuery = useEmissionShows();
  const topicsQuery = useTopicsOptions();

  const handleRefresh = React.useCallback(() => {
    void Promise.all([postsQuery.refetch(), showsQuery.refetch(), topicsQuery.refetch()]);
  }, [postsQuery, showsQuery, topicsQuery]);

  return (
    <TabShell>
      {({ liveCardBottom }) => (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={postsQuery.isRefetching || showsQuery.isRefetching || topicsQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }>
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
  const [featuredSaved, setFeaturedSaved] = React.useState<Record<string, boolean>>({});
  const [savedNews, setSavedNews] = React.useState<Record<string, boolean>>({});
  const [savedPodcasts, setSavedPodcasts] = React.useState<Record<string, boolean>>(() =>
    PODCASTS.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.saved;
      return acc;
    }, {})
  );
  const [selectedTopic, setSelectedTopic] = React.useState<string>('all');
  const topicsQuery = useTopicsOptions();
  const postsQuery = usePosts();
  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);
  const shouldShowShowsSection = showsQuery.isLoading || shows.length > 0;
  const featuredItems = React.useMemo(() => selectHeadlineItems(posts, shows, t), [posts, shows, t]);
  const shouldShowHeadlinesSection = postsQuery.isLoading || showsQuery.isLoading || featuredItems.length > 0;

  const topicChips = React.useMemo(() => {
    return selectTopicChipOptions(topicsQuery.data ?? [])
      .filter((item) => item.topicKey !== null)
      .map((item) => ({
        key: `api:${item.id}`,
        label: item.label,
        topicKey: item.topicKey,
      }));
  }, [topicsQuery.data]);

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

  React.useEffect(() => {
    if (featuredItems.length === 0) {
      return;
    }

    setFeaturedSaved((current) => {
      const next = { ...current };

      for (const item of featuredItems) {
        if (!(item.key in next)) {
          next[item.key] = false;
        }
      }

      return next;
    });
  }, [featuredItems]);

  const filteredNews = React.useMemo(
    () =>
      selectedTopic === 'all'
        ? posts
        : posts.filter((item) => {
            const selected = topicChips.find((topic) => topic.key === selectedTopic);
            return selected ? item.topicKey === selected.topicKey : false;
          }),
    [posts, selectedTopic, topicChips]
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

      {shouldShowHeadlinesSection ? (
        <>
          <SectionHeader title={t('homeFeed.headlineSection')} actionLabel={t('common.learnMore')} />

          <ScrollView
            horizontal
            style={styles.headlinesScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}>
            {postsQuery.isLoading || showsQuery.isLoading
              ? [0, 1].map((index) => (
                  <HeadlineCardSkeleton
                    key={`headline-loading-${index}`}
                    withActiveAction={index === 1}
                    showLiveDot={index === 0}
                  />
                ))
              : featuredItems.map((item) => {
                  const isSaved = featuredSaved[item.key] ?? false;

                  return (
                    <HeadlineCard
                      key={item.key}
                      badge={item.badge}
                      date={item.date}
                      title={item.title}
                      imageSource={item.imageSource}
                      fallbackVariant={item.fallbackVariant}
                      showBadgeDot={item.showBadgeDot}
                      actionLabel={t(isSaved ? 'homeFeed.cancelSaved' : 'homeFeed.saveForLater')}
                      actionActive={isSaved}
                      onPress={() => router.push(item.route as never)}
                      onPressAction={() => toggleFeaturedSaved(item.key)}
                    />
                  );
                })}
          </ScrollView>
        </>
      ) : null}

      {shouldShowShowsSection ? (
        <>
          <SectionHeader title={t('homeFeed.showsSection')} actionLabel={t('homeFeed.seeMore')} />

          <ScrollView
            horizontal
            style={styles.showsScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}>
            {showsQuery.isLoading
              ? SHOWS.map((item) => (
                  <ShowCard
                    key={item.key}
                    title={t(`homeFeed.${item.titleKey}`)}
                    imageSource={item.imageSource}
                  />
                ))
              : shows.map((item) => (
                  <ShowCard
                    key={item.slug}
                    title={item.title}
                    imageSource={item.imageSource}
                    onPress={() => router.push(`/emissions/${item.slug}`)}
                  />
                ))}
          </ScrollView>
        </>
      ) : null}

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
        showDivider={false}
        onPress={() => router.push('/actualites' as never)}
      />

      <View style={[styles.newsList, { borderTopColor: theme.homeChipBorder }]}>
        {postsQuery.isLoading ? (
          NEWS_ITEMS.map((item, index) => (
            <NewsRowSkeleton
              key={`news-loading-${item.key}`}
              showBadge={item.hasBadge}
              saved={item.saved}
              showDivider={index < NEWS_ITEMS.length - 1}
            />
          ))
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item, index) => (
            <NewsListItem
              key={item.slug}
              title={item.title}
              date={item.publishedAtLabel}
              imageSource={item.imageSource}
              saved={savedNews[item.slug] ?? false}
              hasBadge={item.kind === 'media'}
              showDivider={index < filteredNews.length - 1}
              onPress={() => router.push((item.kind === 'media' ? `/actualites/media/${item.slug}` : `/actualites/${item.slug}`) as never)}
              onPressSave={() => toggleNewsSaved(item.slug)}
            />
          ))
        ) : (
          <View style={styles.emptyNewsState}>
            <ThemedText style={[styles.emptyNewsText, { color: theme.homeSubtitle }]}>
              {selectedTopic === 'all' ? t('homeFeed.emptyAll') : t('homeFeed.emptyTopic')}
            </ThemedText>
          </View>
        )}
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
          <SavedForLaterActiveIcon width={14} height={16} color={theme.primary} />
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
        styles.newsItem,
        showDivider && {
          borderBottomColor: theme.homeChipBorder,
          borderBottomWidth: 1,
        },
      ]}>
      <View style={styles.newsRow}>
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
            <SavedForLaterActiveIcon width={18} height={20} color={theme.primary} />
          ) : (
            <BookmarkSimple size={20} weight="regular" color={theme.homeChipBorder} />
          )}
        </View>
      </View>
    </View>
  );
}

type HomeHeadlineItem = {
  key: string;
  badge: string;
  date: string;
  title: string;
  imageSource?: string | number;
  fallbackVariant: 'dark' | 'blue';
  showBadgeDot: boolean;
  route: string;
};

function selectHeadlineItems(posts: Post[], shows: EmissionShow[], t: (key: string) => string) {
  const items: HomeHeadlineItem[] = [];
  const usedKeys = new Set<string>();
  const featuredPosts = posts.filter((post) => post.isFeatured);
  const regularPosts = posts.filter((post) => !post.isFeatured);

  const pushItem = (item: HomeHeadlineItem | null) => {
    if (!item || usedKeys.has(item.key) || items.length >= 2) {
      return;
    }

    usedKeys.add(item.key);
    items.push(item);
  };

  pushItem(mapPostToHeadlineItem(featuredPosts[0] ?? regularPosts[0]));
  pushItem(mapShowToHeadlineItem(shows[0], t));

  for (const post of [...featuredPosts.slice(1), ...regularPosts]) {
    if (items.length >= 2) {
      break;
    }

    pushItem(mapPostToHeadlineItem(post));
  }

  for (const show of shows.slice(1)) {
    if (items.length >= 2) {
      break;
    }

    pushItem(mapShowToHeadlineItem(show, t));
  }

  return items;
}

function mapPostToHeadlineItem(post: Post | undefined): HomeHeadlineItem | null {
  if (!post) {
    return null;
  }

  return {
    key: `post:${post.slug}`,
    badge: post.kind === 'media' ? 'Media' : 'Article',
    date: post.publishedAtLabel,
    title: post.title,
    imageSource: post.imageSource,
    fallbackVariant: post.kind === 'media' ? 'blue' : 'dark',
    showBadgeDot: post.isFeatured || post.kind === 'media',
    route: post.kind === 'media' ? `/actualites/media/${post.slug}` : `/actualites/${post.slug}`,
  };
}

function mapShowToHeadlineItem(show: EmissionShow | undefined, t: (key: string) => string): HomeHeadlineItem | null {
  if (!show) {
    return null;
  }

  return {
    key: `show:${show.slug}`,
    badge: t('tabs.emissions'),
    date: show.publishedAtLabel,
    title: show.title,
    imageSource: show.imageSource,
    fallbackVariant: 'blue',
    showBadgeDot: false,
    route: `/emissions/${show.slug}`,
  };
}

function ShowCard({
  title,
  imageSource,
  onPress,
}: {
  title: string;
  imageSource?: string | number;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.showCard, pressed && styles.pressed]}>
      <ContentImage source={imageSource} style={styles.showImage} />
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
  showDivider = true,
  onPress,
}: {
  title: string;
  actionLabel: string;
  showDivider?: boolean;
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
      {showDivider ? <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} /> : null}
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
  emptyNewsState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyNewsText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    textAlign: 'center',
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
  newsItem: {
    paddingVertical: 14,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
