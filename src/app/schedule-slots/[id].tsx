import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowsOutSimple, BookmarkSimple, MagnifyingGlass, Pause, Play, SpeakerHigh, SpeakerX } from 'phosphor-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { SavedForLaterActiveIcon } from '@/components/ui/saved-for-later-active-icon';
import { Palette, Spacing } from '@/constants/theme';
import { useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import {
  getSlotTimeLabel,
  isScheduleSlotLive,
  selectProgramById,
  selectSchedulePrograms,
} from '@/features/schedule-slots/application/select-schedule-programs';
import { useScheduleSlots } from '@/features/schedule-slots/infrastructure/fetch-schedule-slots';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

type MediaMode = 'video' | 'audio';

export default function ScheduleSlotDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const programInfo = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const scheduleQuery = useScheduleSlots();
  const showsQuery = useEmissionShows();
  const programs = React.useMemo(
    () => selectSchedulePrograms(scheduleQuery.data ?? [], showsQuery.data ?? []),
    [scheduleQuery.data, showsQuery.data]
  );
  const program = React.useMemo(() => selectProgramById(programs, id), [id, programs]);
  const relatedEpisodes = React.useMemo(() => program?.otherEpisodes.slice(0, 3) ?? [], [program]);
  const [mediaMode, setMediaMode] = React.useState<MediaMode>('video');
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});
  const liveCardBottom = insets.bottom + 10;

  React.useEffect(() => {
    if (program?.hasVideo) {
      return;
    }

    setMediaMode('audio');
  }, [program?.hasVideo]);

  React.useEffect(() => {
    if (scheduleQuery.isSuccess && !program) {
      router.replace('/schedule-slots' as never);
    }
  }, [program, router, scheduleQuery.isSuccess]);

  React.useEffect(() => {
    if (relatedEpisodes.length === 0) {
      return;
    }

    setSavedMap((current) => {
      const next = { ...current };
      for (const episode of relatedEpisodes) {
        if (!(episode.id in next)) {
          next[episode.id] = false;
        }
      }
      return next;
    });
  }, [relatedEpisodes]);

  const description = React.useMemo(() => {
    if (!program) {
      return '';
    }

    return program.description.trim() || program.show?.description.trim() || 'Aucune description disponible.';
  }, [program]);

  const handleRefresh = React.useCallback(() => {
    void Promise.all([scheduleQuery.refetch(), showsQuery.refetch()]);
  }, [scheduleQuery, showsQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <View style={styles.headerBlock}>
        <AppTopBar
          leftAction={{
            icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace('/schedule-slots' as never);
            },
          }}
          rightAction={{
            icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
            onPress: () => router.push('/search' as never),
          }}
          centerContent={<ThemedText style={styles.headerTitle}>{program?.slot.label ?? 'Programme'}</ThemedText>}
          style={styles.topBar}
        />

        <View style={styles.modeWrap}>
          <View style={styles.modeTabs}>
            <ModeButton label="Video" active={mediaMode === 'video'} onPress={() => setMediaMode('video')} disabled={!program?.hasVideo} />
            <ModeButton label="Audio" active={mediaMode === 'audio'} onPress={() => setMediaMode('audio')} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 96 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={scheduleQuery.isRefetching || showsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }>
        {scheduleQuery.isLoading ? <ScreenMessage message="Chargement du programme..." /> : null}
        {scheduleQuery.isError ? <ScreenMessage message="Impossible de charger ce programme." /> : null}

        {!scheduleQuery.isLoading && !scheduleQuery.isError && program ? (
          <>
            <View style={styles.hero}>
              <ContentImage source={program.imageSource} style={styles.heroImage} />
              <View style={styles.heroOverlay} />

              {!isScheduleSlotLive(program.slot) ? (
                <View style={styles.upcomingBadge}>
                  <ThemedText style={styles.upcomingBadgeText}>Programme a venir</ThemedText>
                </View>
              ) : null}

              <View style={styles.heroControls}>
                <View style={styles.progressTrack} />

                <View style={styles.controlsRow}>
                  <IconControl
                    icon={playing ? <Pause size={18} weight="fill" color={Palette.neutral['100']} /> : <Play size={18} weight="fill" color={Palette.neutral['100']} />}
                    onPress={() => setPlaying((current) => !current)}
                  />
                  <IconControl
                    icon={muted ? <SpeakerX size={18} weight="bold" color={Palette.neutral['100']} /> : <SpeakerHigh size={18} weight="bold" color={Palette.neutral['100']} />}
                    onPress={() => setMuted((current) => !current)}
                  />
                  <View style={styles.timePill}>
                    <ThemedText style={styles.timeText}>00:00 / 00:00</ThemedText>
                  </View>
                  <View style={styles.controlsSpacer} />
                  <IconControl
                    icon={<ArrowsOutSimple size={18} weight="bold" color={Palette.neutral['100']} />}
                    onPress={() => undefined}
                  />
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <ThemedText style={styles.title}>{program.title}</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.headlineDate }]}>
                {`${program.slot.label.toUpperCase()} • ${program.currentEpisode?.publishedAtLabel.toUpperCase() ?? getSlotTimeLabel(program.slot)}`}
              </ThemedText>

              <View style={styles.hostCard}>
                <ContentImage source={program.show?.hosts[0]?.avatar ?? program.imageSource} style={styles.hostAvatar} />
                <View style={styles.hostText}>
                  <ThemedText style={styles.hostName}>{(program.show?.hosts[0]?.name ?? program.host).toUpperCase()}</ThemedText>
                  <ThemedText style={styles.hostRole}>Animateur</ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.description, { color: theme.homeSubtitle }]}>{description}</ThemedText>

              {relatedEpisodes.length > 0 ? (
                <>
                  <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Autres episodes</ThemedText>
                    <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
                  </View>

                  <View>
                    {relatedEpisodes.map((episode, index) => (
                      <RelatedEpisodeItem
                        key={episode.id}
                        title={episode.title}
                        date={episode.publishedAtLabel}
                        imageSource={episode.imageSource}
                        saved={savedMap[episode.id] ?? false}
                        showDivider={index < relatedEpisodes.length - 1}
                        onPress={() => {
                          if (!program.show) {
                            return;
                          }

                          router.push(`/emissions/${program.show.slug}/${episode.id}` as never);
                        }}
                        onPressSave={() =>
                          setSavedMap((current) => ({ ...current, [episode.id]: !current[episode.id] }))
                        }
                      />
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={"Suivez l'info en direct\nsur Top Congo"}
          subtitle={programInfo.schedule || undefined}
          onPressCard={() => router.push('/direct' as never)}
          onPressPlay={() => router.push('/direct' as never)}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isStarting={isStarting}
          disabled={false}
        />
      </View>
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active ? styles.modeButtonActive : styles.modeButtonInactive,
        disabled && styles.modeButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <ThemedText style={[styles.modeLabel, active ? styles.modeLabelActive : styles.modeLabelInactive]}>{label}</ThemedText>
    </Pressable>
  );
}

function IconControl({ icon, onPress }: { icon: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.iconControl, pressed && styles.pressed]}>
      {icon}
    </Pressable>
  );
}

function RelatedEpisodeItem({
  title,
  date,
  imageSource,
  saved,
  showDivider,
  onPress,
  onPressSave,
}: {
  title: string;
  date: string;
  imageSource: string | number;
  saved: boolean;
  showDivider: boolean;
  onPress: () => void;
  onPressSave: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.relatedRow,
        showDivider && {
          borderBottomWidth: 1,
          borderBottomColor: theme.homeChipBorder,
        },
      ]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.relatedMain, pressed && styles.pressed]}>
        <View style={styles.relatedMediaWrap}>
          <ContentImage source={imageSource} style={styles.relatedMedia} />
          <View style={styles.relatedPlayBadge}>
            <Play size={14} weight="fill" color={theme.primary} />
          </View>
        </View>

        <View style={styles.relatedText}>
          <ThemedText style={[styles.relatedDate, { color: theme.headlineDate }]}>{date}</ThemedText>
          <ThemedText numberOfLines={3} style={styles.relatedTitle}>
            {title}
          </ThemedText>
        </View>
      </Pressable>

      <Pressable hitSlop={8} onPress={onPressSave} style={({ pressed }) => [styles.relatedSave, pressed && styles.pressed]}>
        {saved ? (
          <SavedForLaterActiveIcon width={15} height={19} color={theme.primary} />
        ) : (
          <BookmarkSimple size={20} weight="regular" color={theme.primary} />
        )}
      </Pressable>
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
  headerBlock: {
    backgroundColor: Palette.blue['800'],
  },
  topBar: {
    paddingBottom: 0,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  modeWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: 0,
    paddingBottom: Spacing.three,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#4968AB',
    borderRadius: 8,
    padding: 6,
  },
  modeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: Palette.neutral['100'],
  },
  modeButtonInactive: {
    backgroundColor: 'transparent',
  },
  modeButtonDisabled: {
    opacity: 0.45,
  },
  modeLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  modeLabelActive: {
    color: Palette.blue['800'],
  },
  modeLabelInactive: {
    color: Palette.neutral['100'],
  },
  content: {
    paddingBottom: 24,
  },
  hero: {
    height: 244,
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,37,96,0.34)',
  },
  upcomingBadge: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(155,29,29,0.72)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  upcomingBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  heroControls: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.two,
    gap: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconControl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePill: {
    minWidth: 128,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  timeText: {
    color: Palette.neutral['100'],
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  controlsSpacer: {
    flex: 1,
  },
  body: {
    backgroundColor: '#F3F3F5',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 14,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E7F0FF',
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  hostText: {
    flex: 1,
  },
  hostName: {
    color: Palette.blue['800'],
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  hostRole: {
    color: Palette.neutral['800'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
  },
  sectionHeader: {
    gap: 8,
    marginTop: 4,
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
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  relatedMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  relatedMediaWrap: {
    position: 'relative',
  },
  relatedMedia: {
    width: 136,
    height: 76,
    borderRadius: 6,
  },
  relatedPlayBadge: {
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
  relatedText: {
    flex: 1,
  },
  relatedDate: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  relatedTitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  relatedSave: {
    width: 26,
    alignItems: 'flex-end',
  },
  messageWrap: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  messageText: {
    color: Palette.neutral['500'],
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.84,
  },
});
