import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadlineCard } from '@/components/ui/headline-card';
import { TabShell } from '@/components/ui/tab-shell';
import { useTheme } from '@/hooks/use-theme';

const QUICK_TOPICS = [
  { key: 'economy', emoji: '\u{1F30D}' },
  { key: 'technology', emoji: '\u{1F4BB}' },
  { key: 'security', emoji: '\u{1FA96}' },
] as const;

const FEATURED_NEWS = [
  {
    key: 'featuredOne',
    badgeKey: 'cardOneBadge',
    dateKey: 'cardOneDate',
    titleKey: 'cardOneTitle',
    imageSource: require('@/assets/images/home/concert.png'),
    fallbackVariant: 'dark' as const,
    saved: false,
    showBadgeDot: true,
  },
  {
    key: 'featuredTwo',
    badgeKey: 'cardTwoBadge',
    dateKey: 'cardTwoDate',
    titleKey: 'cardTwoTitle',
    imageSource: require('@/assets/images/home/emission.png'),
    fallbackVariant: 'blue' as const,
    saved: true,
    showBadgeDot: false,
  },
] as const;

const NEWS_ITEMS = [
  { key: 'listOneTitle', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: true },
  { key: 'listTwoTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true },
  { key: 'listThreeTitle', imageSource: require('@/assets/images/home/concert.png'), saved: false, hasBadge: false },
  { key: 'listFourTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: false },
  { key: 'listFiveTitle', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: false },
  { key: 'listSixTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true },
] as const;

export default function HomeFeedScreen() {
  return (
    <TabShell>
      {({ liveCardBottom }) => (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 90 }]}
          showsVerticalScrollIndicator={false}>
          <HomeContent />
        </ScrollView>
      )}
    </TabShell>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const toggleFeaturedSaved = React.useCallback((key: string) => {
    setFeaturedSaved((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const toggleNewsSaved = React.useCallback((key: string) => {
    setSavedNews((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  return (
    <>
      <View>
        <ThemedText style={[styles.title, { color: theme.homeTitle }]}>
          {t('homeFeed.welcome', { name: 'Trésor' })}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.homeSubtitle }]}>
          {t('homeFeed.subtitle')}
        </ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
        {QUICK_TOPICS.map((topic) => (
          <Pressable
            key={topic.key}
            style={({ pressed }) => [
              styles.topicChip,
              {
                borderColor: theme.homeChipBorder,
                backgroundColor: theme.homeChipBackground,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.topicText, { color: theme.homeChipText }]}>
              {topic.emoji} {t(`topics.${topic.key}`)}
            </ThemedText>
          </Pressable>
        ))}
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

      <SectionHeader title={t('homeFeed.newsListSection')} actionLabel={t('common.learnMore')} />

      <View style={[styles.newsList, { borderTopColor: theme.homeChipBorder }]}>
        {NEWS_ITEMS.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.newsRow,
              index < NEWS_ITEMS.length - 1 && {
                borderBottomColor: theme.homeChipBorder,
                borderBottomWidth: 1,
              },
            ]}>
            <Pressable style={({ pressed }) => [styles.newsMain, pressed && styles.pressed]}>
              <View style={styles.newsMedia}>
                <Image source={item.imageSource} style={styles.newsImage} contentFit="cover" transition={0} />
                {item.hasBadge ? (
                  <View style={styles.newsBadge}>
                    <FontAwesome5 name="certificate" size={18} color={theme.headlineAccent} />
                    <Feather
                      name="check"
                      size={9}
                      color={theme.headlineAccentText}
                      style={styles.newsBadgeCheck}
                    />
                  </View>
                ) : null}
              </View>

              <ThemedText numberOfLines={3} style={[styles.newsTitle, { color: theme.homeTitle }]}>
                {t(`homeFeed.${item.key}`)}
              </ThemedText>
            </Pressable>

            <Pressable
              hitSlop={8}
              onPress={() => toggleNewsSaved(item.key)}
              style={({ pressed }) => [styles.newsSave, pressed && styles.pressed]}>
              {savedNews[item.key] ? (
                <FontAwesome5 name="bookmark" size={18} color={theme.primary} solid />
              ) : (
                <Feather name="bookmark" size={20} color={theme.homeSectionLink} />
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </>
  );
}

function SectionHeader({ title, actionLabel }: { title: string; actionLabel: string }) {
  const theme = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={[styles.sectionTitle, { color: theme.homeSectionTitle }]}>{title}</ThemedText>
      <Pressable onPress={() => {}} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText style={[styles.seeMore, { color: theme.primary }]}>{actionLabel}</ThemedText>
      </Pressable>
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
  topicsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  topicChip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topicText: {
    fontSize: 17 / 1.2,
    lineHeight: 22 / 1.2,
    fontWeight: 500,
  },
  sectionHeader: {
    marginTop: 6,
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
  cardsRow: {
    gap: 12,
    paddingLeft: 16,
    paddingBottom: 2,
  },
  headlinesScroll: {
    marginHorizontal: -16,
  },
  newsList: {
    marginTop: 2,
    borderTopWidth: 1,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsBadgeCheck: {
    position: 'absolute',
  },
  newsTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  newsSave: {
    width: 24,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.8,
  },
});
