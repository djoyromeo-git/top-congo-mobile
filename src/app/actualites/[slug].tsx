import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette, Spacing } from '@/constants/theme';
import {
  findPost,
  selectRelatedPosts,
  usePosts,
} from '@/features/content/infrastructure/fetch-posts';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function ActualiteDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const postsQuery = usePosts();
  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const item = React.useMemo(() => findPost(posts, slug), [posts, slug]);
  const relatedItems = React.useMemo(
    () => (item ? selectRelatedPosts(posts, item.slug) : []),
    [item, posts]
  );
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});

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

  React.useEffect(() => {
    if (postsQuery.isSuccess && !item) {
      router.replace('/actualites' as never);
    }
  }, [item, postsQuery.isSuccess, router]);

  const toggleSaved = React.useCallback((entrySlug: string) => {
    setSavedMap((current) => ({ ...current, [entrySlug]: !current[entrySlug] }));
  }, []);

  const openItem = React.useCallback(
    (entrySlug: string) => {
      const entry = posts.find((candidate) => candidate.slug === entrySlug);
      if (!entry) {
        return;
      }

      router.replace((entry.kind === 'media' ? `/actualites/media/${entrySlug}` : `/actualites/${entrySlug}`) as never);
    },
    [posts, router]
  );

  const handleRefresh = React.useCallback(() => {
    void postsQuery.refetch();
  }, [postsQuery]);

  const liveCardBottom = insets.bottom + 10;

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/actualites' as never),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>{t('actualites.title')}</ThemedText>}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={postsQuery.isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
        }>
        {postsQuery.isLoading ? (
          <ScreenMessage message={t('actualites.articleLoading')} />
        ) : postsQuery.isError ? (
          <ScreenMessage message={t('actualites.articleError')} />
        ) : !item ? null : (
          <>
            <ContentImage source={item.imageSource} style={styles.heroImage} />

            <View style={styles.body}>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.homeSubtitle }]}>
                {[item.sectionLabel.toUpperCase(), item.publishedAtLabel.toUpperCase()].filter(Boolean).join(' • ')}
              </ThemedText>

              <View style={styles.authorCard}>
                <ContentImage source={item.imageSource} style={styles.authorAvatar} />
                <View style={styles.authorTextWrap}>
                  <ThemedText style={styles.authorName}>{item.source.toUpperCase()}</ThemedText>
                  <ThemedText style={styles.authorRole}>
                    {item.readingTimeLabel
                      ? t('actualites.readTime', { duration: item.readingTimeLabel })
                      : t('actualites.source')}
                  </ThemedText>
                </View>
              </View>

              {item.contentBlocks.length > 0 ? (
                item.contentBlocks.map((paragraph, index) => (
                  <ThemedText key={`${item.slug}-paragraph-${index}`} style={[styles.paragraph, { color: theme.homeSubtitle }]}>
                    {paragraph}
                  </ThemedText>
                ))
              ) : item.summary ? (
                <ThemedText style={[styles.paragraph, { color: theme.homeSubtitle }]}>{item.summary}</ThemedText>
              ) : null}

            </View>

            {relatedItems.length > 0 ? (
              <View style={styles.relatedSection}>
                <ThemedText style={styles.relatedTitle}>{t('actualites.relatedTitle')}</ThemedText>
                <View style={[styles.divider, { backgroundColor: theme.homeChipBorder }]} />

                {relatedItems.map((related, index) => (
                  <ActualiteListItem
                    key={related.slug}
                    title={related.title}
                    imageSource={related.imageSource}
                    date={related.publishedAtLabel}
                    saved={savedMap[related.slug] ?? false}
                    duration={related.kind === 'media' ? related.readingTimeLabel ?? undefined : undefined}
                    showPlayBadge={related.kind === 'media'}
                    showVerifiedBadge={related.isFeatured}
                    showDivider={index < relatedItems.length - 1}
                    onPress={() => openItem(related.slug)}
                    onPressSave={() => toggleSaved(related.slug)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}

        <View style={{ height: liveCardBottom + 88 }} />
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={t('homeFeed.liveCardTitle')}
          subtitle={program.schedule || undefined}
          onPressCard={() => router.push('/direct')}
          onPressPlay={() => router.push('/direct')}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          disabled={false}
        />
      </View>
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
    paddingBottom: 40,
  },
  messageWrap: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  messageText: {
    color: Palette.neutral['700'],
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  heroImage: {
    width: '100%',
    height: 244,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: 18,
    gap: 16,
  },
  title: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 700,
    color: Palette.neutral['800'],
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: 500,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E7F0FF',
    borderRadius: 8,
    padding: 10,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  authorTextWrap: {
    flex: 1,
  },
  authorName: {
    color: Palette.blue['800'],
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
  },
  authorRole: {
    color: Palette.neutral['800'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
  },
  relatedSection: {
    paddingHorizontal: Spacing.three,
    paddingTop: 22,
  },
  relatedTitle: {
    color: Palette.neutral['800'],
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  divider: {
    height: 1,
    marginTop: 14,
    marginBottom: 2,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.82,
  },
});
