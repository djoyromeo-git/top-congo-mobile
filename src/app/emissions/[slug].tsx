import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { Palette, Spacing } from '@/constants/theme';
import {
  type EmissionEpisode,
  type EmissionShowHost,
  type EmissionShowScheduleSlot,
  findEmissionShow,
  useEmissionShows,
} from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'episodes' | 'about' | 'program';

function getDayLabel(dayOfWeek: string, t: (key: string) => string) {
  switch (dayOfWeek.toLowerCase()) {
    case 'monday':
      return t('emissions.days.monday');
    case 'tuesday':
      return t('emissions.days.tuesday');
    case 'wednesday':
      return t('emissions.days.wednesday');
    case 'thursday':
      return t('emissions.days.thursday');
    case 'friday':
      return t('emissions.days.friday');
    case 'saturday':
      return t('emissions.days.saturday');
    case 'sunday':
      return t('emissions.days.sunday');
    default:
      return dayOfWeek;
  }
}

function getSlotTypeLabel(slot: EmissionShowScheduleSlot, t: (key: string) => string) {
  return slot.slotType.toLowerCase() === 'replay'
    ? t('emissions.slotTypes.replay')
    : t('emissions.slotTypes.live');
}

function EpisodeCard({
  episode,
  onPress,
}: {
  episode: EmissionEpisode;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.episodeCard,
        {
          backgroundColor: theme.background,
          borderColor: theme.homeChipBorder,
        },
        pressed && styles.pressed,
      ]}>
      <ContentImage source={episode.imageSource} style={styles.episodeImage} />
      <View style={styles.episodeBody}>
        <View style={styles.episodeMetaRow}>
          {episode.publishedAtLabel ? (
            <ThemedText style={[styles.episodeMetaText, { color: theme.homeSubtitle }]}>
              {episode.publishedAtLabel}
            </ThemedText>
          ) : null}
          {episode.isPremium ? (
            <View style={[styles.episodeBadge, { backgroundColor: Palette.red['800'] }]}>
              <ThemedText style={styles.episodeBadgeText}>{t('emissions.premiumBadge')}</ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText numberOfLines={2} style={styles.episodeTitle}>
          {episode.title}
        </ThemedText>
        <ThemedText numberOfLines={2} style={[styles.episodeDescription, { color: theme.homeSubtitle }]}>
          {episode.description || t('emissions.noEpisodeDescription')}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function HostCard({ host, fallbackImageSource }: { host: EmissionShowHost; fallbackImageSource: string | number }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.hostCard}>
      <ContentImage source={host.avatar ?? fallbackImageSource} style={styles.hostAvatar} />
      <View style={styles.hostText}>
        <ThemedText style={styles.hostName}>{host.name}</ThemedText>
        <ThemedText style={[styles.hostRole, { color: theme.homeSubtitle }]}>
          {t('emissions.hostRole')}
        </ThemedText>
      </View>
    </View>
  );
}

function ScheduleCard({ slot }: { slot: EmissionShowScheduleSlot }) {
  const { t } = useTranslation();

  return (
    <View style={styles.scheduleRow}>
      <ThemedText style={styles.scheduleDay}>{getDayLabel(slot.dayOfWeek, t).toUpperCase()}</ThemedText>
      <View
        style={[
          styles.schedulePill,
          {
            backgroundColor: '#E8E8E8',
          },
        ]}>
        <ThemedText numberOfLines={1} style={styles.schedulePillText}>
          {[getSlotTypeLabel(slot, t).toUpperCase(), `${slot.startsAt.toUpperCase()} - ${slot.endsAt.toUpperCase()}`].join(
            ' • '
          )}
        </ThemedText>
      </View>
    </View>
  );
}

function EmissionTabChip({
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
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabChip,
        {
          borderColor: selected ? theme.primary : theme.homeChipBorder,
          backgroundColor: selected ? theme.primary : theme.homeChipBackground,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        numberOfLines={1}
        style={[
          styles.tabChipLabel,
          {
            color: selected ? theme.onPrimary : theme.homeChipText,
          },
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function EmissionDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const showsQuery = useEmissionShows();
  const shows = React.useMemo(() => showsQuery.data ?? [], [showsQuery.data]);
  const emission = React.useMemo(() => findEmissionShow(shows, slug), [shows, slug]);
  const aboutHosts = React.useMemo(
    () =>
      emission?.hosts.length
        ? emission.hosts
        : emission
          ? [
              {
                id: 'fallback-host',
                name: emission.host,
                avatar: null,
                bio: '',
                role: 'host',
                isPrimary: true,
                sortOrder: 0,
              },
            ]
          : [],
    [emission]
  );
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
                <ThemedText style={styles.heroTitle}>{emission.title.toLocaleUpperCase()}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>{t('emissions.withHost', { host: emission.host })}</ThemedText>
              </View>
            </View>

            <View style={styles.tabs}>
              <View style={styles.tabItem}>
                <EmissionTabChip
                  label={t('emissions.tabsEpisodes')}
                  selected={tab === 'episodes'}
                  onPress={() => setTab('episodes')}
                />
              </View>
              <View style={styles.tabItem}>
                <EmissionTabChip
                  label={t('emissions.tabsAbout')}
                  selected={tab === 'about'}
                  onPress={() => setTab('about')}
                />
              </View>
              <View style={styles.tabItem}>
                <EmissionTabChip
                  label={t('emissions.tabsProgram')}
                  selected={tab === 'program'}
                  onPress={() => setTab('program')}
                />
              </View>
            </View>

            {tab === 'episodes' ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('emissions.tabsEpisodes')}</ThemedText>
                {emission.episodes.length > 0 ? (
                  emission.episodes.map(episode => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onPress={() => router.push(`/emissions/${emission.slug}/${episode.id}`)}
                    />
                  ))
                ) : (
                  <EmptyPanel message={t('emissions.noEpisodes')} themeTextColor={theme.homeSubtitle} />
                )}
              </View>
            ) : null}

            {tab === 'about' ? (
              <View style={styles.section}>
                {aboutHosts.map(host => (
                  <HostCard key={host.id} host={host} fallbackImageSource={emission.imageSource} />
                ))}

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
                {emission.scheduleSlots.length > 0 ? (
                  <View style={styles.scheduleList}>
                    {emission.scheduleSlots.map(slot => <ScheduleCard key={slot.id} slot={slot} />)}
                  </View>
                ) : (
                  <EmptyPanel message={t('emissions.noProgram')} themeTextColor={theme.homeSubtitle} />
                )}
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
          isStarting={isStarting}
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
    <View style={[styles.emptyPanel, { borderColor: 'transparent' }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  tabItem: {
    flex: 1,
  },
  tabChip: {
    minHeight: 37,
    borderRadius: 36,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
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
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
  },
  episodeCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  episodeImage: {
    width: '100%',
    height: 180,
  },
  episodeBody: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  episodeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  episodeMetaText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  episodeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  episodeBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  episodeTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  episodeDescription: {
    fontSize: 14,
    lineHeight: 20,
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
    color: Palette.neutral['800'],
  },
  hostRole: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  scheduleList: {},
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  scheduleDay: {
    width: 90,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: Palette.neutral['500'],
    alignSelf: 'center',
  },
  schedulePill: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  schedulePillText: {
    color: Palette.neutral['800'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyPanel: {
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  sectionDivider: {
    height: 1,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.92,
  },
});
