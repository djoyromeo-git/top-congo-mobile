import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette, Spacing } from '@/constants/theme';
import {
  findEmissionEpisode,
  findEmissionShow,
  useEmissionShows,
} from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDuration(seconds: number | null, t: (key: string, options?: Record<string, unknown>) => string) {
  if (!seconds || seconds <= 0) {
    return null;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return t('emissions.episodeDurationHours', { hours, minutes });
  }

  return t('emissions.episodeDurationMinutes', { minutes });
}

export default function EpisodeDetailScreen() {
  const { t } = useTranslation();
  const { slug, episodeId } = useLocalSearchParams<{ slug?: string; episodeId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);
  const emission = React.useMemo(() => findEmissionShow(shows, slug), [shows, slug]);
  const episode = React.useMemo(() => findEmissionEpisode(emission, episodeId), [emission, episodeId]);

  React.useEffect(() => {
    if (!showsQuery.isSuccess) {
      return;
    }

    if (!emission) {
      router.replace('/(tabs)/emissions');
      return;
    }

    if (!episode) {
      router.replace(`/emissions/${emission.slug}` as never);
    }
  }, [emission, episode, router, showsQuery.isSuccess]);

  const liveCardBottom = insets.bottom + 10;
  const handleGoBack = React.useCallback(() => {
    if (emission) {
      router.push(`/emissions/${emission.slug}` as never);
      return;
    }

    router.replace('/(tabs)/emissions');
  }, [emission, router]);

  const handleOpenAudio = React.useCallback(async () => {
    if (!episode?.audioAsset?.url) {
      return;
    }

    try {
      await Linking.openURL(episode.audioAsset.url);
    } catch {
      // noop
    }
  }, [episode?.audioAsset?.url]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: handleGoBack,
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search'),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>{episode?.title ?? t('emissions.episodeFallbackTitle')}</ThemedText>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!episode || !emission ? (
          <View style={styles.messageWrap}>
            <ThemedText style={styles.messageText}>{t('emissions.detailLoading')}</ThemedText>
          </View>
        ) : (
          <>
            <ContentImage source={episode.imageSource} style={styles.heroImage} />

            <View style={styles.body}>
              <ThemedText style={styles.showTitle}>{emission.title}</ThemedText>
              <ThemedText style={[styles.metaText, { color: theme.homeSubtitle }]}>
                {t('emissions.withHost', { host: emission.host })}
              </ThemedText>

              <ThemedText style={styles.episodeTitle}>{episode.title}</ThemedText>

              <View style={styles.metaStack}>
                {episode.publishedAtLabel ? (
                  <ThemedText style={[styles.metaText, { color: theme.homeSubtitle }]}>
                    {t('emissions.episodePublishedOn', { date: episode.publishedAtLabel })}
                  </ThemedText>
                ) : null}
                {episode.isPremium ? (
                  <View style={[styles.premiumBadge, { backgroundColor: Palette.red['800'] }]}>
                    <ThemedText style={styles.premiumBadgeText}>{t('emissions.premiumBadge')}</ThemedText>
                  </View>
                ) : null}
              </View>

              <ThemedText style={[styles.description, { color: theme.homeSubtitle }]}>
                {episode.description || t('emissions.noEpisodeDescription')}
              </ThemedText>

              {episode.audioAsset ? (
                <AppButton
                  label={
                    episode.audioAsset.provider
                      ? t('emissions.listenOnProvider', { provider: episode.audioAsset.provider })
                      : t('emissions.listenAsset')
                  }
                  onPress={() => {
                    void handleOpenAudio();
                  }}
                  size="lg"
                  style={styles.listenButton}
                />
              ) : null}

              {episode.assets.length > 0 ? (
                <View style={styles.assetsSection}>
                  <ThemedText style={styles.sectionTitle}>{t('emissions.episodeAssets')}</ThemedText>
                  {episode.assets.map(asset => (
                    <View
                      key={asset.id}
                      style={[
                        styles.assetCard,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.homeChipBorder,
                        },
                      ]}>
                      <ThemedText style={styles.assetProvider}>
                        {asset.provider || asset.type}
                      </ThemedText>
                      {asset.language ? (
                        <ThemedText style={[styles.assetMeta, { color: theme.homeSubtitle }]}>
                          {t('emissions.assetLanguage', { language: asset.language })}
                        </ThemedText>
                      ) : null}
                      {formatDuration(asset.durationSeconds, t) ? (
                        <ThemedText style={[styles.assetMeta, { color: theme.homeSubtitle }]}>
                          {t('emissions.assetDuration', {
                            duration: formatDuration(asset.durationSeconds, t),
                          })}
                        </ThemedText>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
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
          isStarting={isStarting}
          disabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  heroImage: {
    width: '100%',
    height: 260,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  showTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: Palette.blue['800'],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  episodeTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  metaStack: {
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  premiumBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  listenButton: {
    marginTop: Spacing.one,
  },
  assetsSection: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  assetCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.two,
    gap: 4,
  },
  assetProvider: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  assetMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
