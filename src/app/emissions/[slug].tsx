import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { TopicChip } from '@/components/ui/topic-chip';
import { Palette, Spacing } from '@/constants/theme';
import { findEmissionShow, useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'episodes' | 'about' | 'program';

export default function EmissionDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);
  const emission = React.useMemo(() => findEmissionShow(shows, slug), [shows, slug]);
  const [tab, setTab] = React.useState<TabKey>('episodes');

  React.useEffect(() => {
    if (showsQuery.isSuccess && !emission) {
      router.replace('/(tabs)/emissions');
    }
  }, [emission, router, showsQuery.isSuccess]);

  const liveCardBottom = insets.bottom + 20;
  const handleRefresh = React.useCallback(() => {
    void showsQuery.refetch();
  }, [showsQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search'),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>{emission?.title ?? t('emissions.detailFallbackTitle')}</ThemedText>}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={showsQuery.isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
        }>
        {showsQuery.isLoading ? (
          <ScreenMessage message={t('emissions.detailLoading')} />
        ) : showsQuery.isError ? (
          <ScreenMessage message={t('emissions.detailError')} />
        ) : !emission ? null : (
          <>
            <View style={styles.hero}>
              <ContentImage source={emission.imageSource} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
              <View style={styles.heroText}>
                <ThemedText style={styles.heroTitle}>{emission.title}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>{t('emissions.withHost', { host: emission.host })}</ThemedText>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              <TopicChip label={t('emissions.tabsEpisodes')} selected={tab === 'episodes'} onPress={() => setTab('episodes')} />
              <TopicChip label={t('emissions.tabsAbout')} selected={tab === 'about'} onPress={() => setTab('about')} />
              <TopicChip label={t('emissions.tabsProgram')} selected={tab === 'program'} onPress={() => setTab('program')} />
            </ScrollView>

            {tab === 'episodes' ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('emissions.tabsEpisodes')}</ThemedText>
                <EmptyPanel
                  message={t('emissions.noEpisodes')}
                  themeTextColor={theme.homeSubtitle}
                />
              </View>
            ) : null}

            {tab === 'about' ? (
              <View style={styles.section}>
                <View style={styles.hostCard}>
                  <ContentImage source={emission.imageSource} style={styles.hostAvatar} />
                  <View style={styles.hostText}>
                    <ThemedText style={styles.hostName}>{emission.host}</ThemedText>
                    <ThemedText style={[styles.hostRole, { color: theme.homeSubtitle }]}>{t('emissions.hostRole')}</ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.sectionTitle}>{t('emissions.aboutTitle')}</ThemedText>
                <ThemedText style={[styles.paragraph, { color: theme.homeSubtitle }]}>
                  {emission.description || t('emissions.noDescription')}
                </ThemedText>
              </View>
            ) : null}

            {tab === 'program' ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('emissions.programTitle')}</ThemedText>
                <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
                <EmptyPanel
                  message={t('emissions.noProgram')}
                  themeTextColor={theme.homeSubtitle}
                />
              </View>
            ) : null}
          </>
        )}

        <View style={{ height: liveCardBottom + 32 }} />
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={program.title}
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

function EmptyPanel({ message, themeTextColor }: { message: string; themeTextColor: string }) {
  return (
    <View style={styles.emptyPanel}>
      <ThemedText style={[styles.emptyText, { color: themeTextColor }]}>{message}</ThemedText>
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
    fontWeight: '700',
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
  hero: {
    height: 240,
    position: 'relative',
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,65,151,0.45)',
  },
  heroText: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
  },
  heroTitle: {
    color: Palette.neutral['100'],
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '400',
  },
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  section: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
    marginBottom: Spacing.one,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#EAF2FF',
    padding: Spacing.two,
    borderRadius: 10,
    marginBottom: Spacing.two,
  },
  hostAvatar: {
    width: 54,
    height: 54,
    borderRadius: 10,
  },
  hostText: {
    flex: 1,
  },
  hostName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  hostRole: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyPanel: {
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
