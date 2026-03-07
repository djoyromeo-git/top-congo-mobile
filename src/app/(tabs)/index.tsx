import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { HeadlineCard } from '@/components/ui/headline-card';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette } from '@/constants/theme';

const QUICK_TOPICS = [
  { key: 'economy', emoji: '\u{1F30D}' },
  { key: 'technology', emoji: '\u{1F4BB}' },
  { key: 'security', emoji: '\u{1FA96}' },
] as const;

export default function HomeFeedScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={Palette.blue['800']} />

      <AppTopBar
        leftAction={{ icon: 'menu', onPress: () => {} }}
        rightAction={{ icon: 'search', onPress: () => {} }}
        logo={
          <Image
            source={require('@/assets/images/logos/app-bar-logo.svg')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View>
          <ThemedText style={styles.title}>{t('homeFeed.welcome', { name: 'Trésor' })}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('homeFeed.subtitle')}</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
          {QUICK_TOPICS.map((topic) => (
            <Pressable key={topic.key} style={({ pressed }) => [styles.topicChip, pressed && styles.pressed]}>
              <ThemedText style={styles.topicText}>
                {topic.emoji} {t(`topics.${topic.key}`)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('homeFeed.headlineSection')}</ThemedText>
          <Pressable onPress={() => {}} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText style={styles.seeMore}>{t('common.learnMore')}</ThemedText>
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
            fallbackColor="#333842"
          />
          <HeadlineCard
            badge={t('homeFeed.cardTwoBadge')}
            date={t('homeFeed.cardTwoDate')}
            title={t('homeFeed.cardTwoTitle')}
            imageSource={require('@/assets/images/home/emission.png')}
            fallbackColor="#2B4A8D"
          />
        </ScrollView>

        <View style={styles.liveCardWrap}>
          <LiveAudioCard title={t('homeFeed.liveCardTitle')} onPress={() => {}} onPressPlay={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F3F5',
  },
  headerLogo: {
    width: 119,
    height: 35,
  },
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
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 4,
    color: '#9C9C9C',
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
    borderColor: '#E3E3E3',
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topicText: {
    color: '#202020',
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
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 38 / 1.2,
    fontWeight: 700,
  },
  seeMore: {
    color: '#A2A2A2',
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
  liveCardWrap: {
    marginTop: 66,
  },
  pressed: {
    opacity: 0.8,
  },
});
