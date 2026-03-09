import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HeadlineCard } from '@/components/ui/headline-card';
import { TabShell } from '@/components/ui/tab-shell';
import { useTheme } from '@/hooks/use-theme';

const QUICK_TOPICS = [
  { key: 'economy', emoji: '\u{1F30D}' },
  { key: 'technology', emoji: '\u{1F4BB}' },
  { key: 'security', emoji: '\u{1FA96}' },
] as const;

export default function HomeFeedScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const liveCardBottom = insets.bottom + 76;

  return (
    <TabShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 90 }]}
        showsVerticalScrollIndicator={false}>
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

        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: theme.homeSectionTitle }]}>
            {t('homeFeed.headlineSection')}
          </ThemedText>
          <Pressable onPress={() => {}} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText style={[styles.seeMore, { color: theme.homeSectionLink }]}> 
              {t('common.learnMore')}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          style={styles.headlinesScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}>
          <HeadlineCard
            badge={t('homeFeed.cardOneBadge')}
            date={t('homeFeed.cardOneDate')}
            title={t('homeFeed.cardOneTitle')}
            imageSource={require('@/assets/images/home/concert.png')}
            fallbackVariant="dark"
          />
          <HeadlineCard
            badge={t('homeFeed.cardTwoBadge')}
            date={t('homeFeed.cardTwoDate')}
            title={t('homeFeed.cardTwoTitle')}
            imageSource={require('@/assets/images/home/emission.png')}
            fallbackVariant="blue"
          />
        </ScrollView>
      </ScrollView>
    </TabShell>
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
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 38 / 1.2,
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
  pressed: {
    opacity: 0.8,
  },
});
