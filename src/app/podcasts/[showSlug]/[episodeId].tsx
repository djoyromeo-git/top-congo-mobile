import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowsOutSimple, BookmarkSimple, MagnifyingGlass, Pause, Play, SpeakerHigh, SpeakerX, X } from 'phosphor-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { SavedForLaterActiveIcon } from '@/components/ui/saved-for-later-active-icon';
import { Palette, Spacing } from '@/constants/theme';
import {
  findPodcastItem,
  selectPodcastLibrary,
  selectRelatedPodcastItems,
  type PodcastLibraryItem,
} from '@/features/emissions/application/select-podcast-library';
import { useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import { useTheme } from '@/hooks/use-theme';

type MediaMode = 'video' | 'audio';

export default function PodcastEpisodeScreen() {
  const { showSlug, episodeId } = useLocalSearchParams<{ showSlug?: string; episodeId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showsQuery = useEmissionShows();
  const items = React.useMemo(() => selectPodcastLibrary(showsQuery.data ?? []), [showsQuery.data]);
  const item = React.useMemo(() => findPodcastItem(items, showSlug, episodeId), [episodeId, items, showSlug]);
  const relatedItems = React.useMemo(
    () => (item ? selectRelatedPodcastItems(items, item.key) : []),
    [item, items]
  );
  const [mediaMode, setMediaMode] = React.useState<MediaMode>('video');
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>({});
  const [showMiniPlayer, setShowMiniPlayer] = React.useState(true);

  React.useEffect(() => {
    if (item?.hasVideo) {
      return;
    }

    setMediaMode('audio');
  }, [item?.hasVideo]);

  React.useEffect(() => {
    if (items.length === 0) {
      return;
    }

    setSavedMap((current) => {
      const next = { ...current };

      for (const entry of items) {
        if (!(entry.key in next)) {
          next[entry.key] = false;
        }
      }

      return next;
    });
  }, [items]);

  React.useEffect(() => {
    if (showsQuery.isSuccess && !item) {
      router.replace('/podcasts' as never);
    }
  }, [item, router, showsQuery.isSuccess]);

  const openItem = React.useCallback(
    (entry: PodcastLibraryItem) => {
      router.push(`/podcasts/${entry.showSlug}/${entry.episodeId}` as never);
    },
    [router]
  );

  const toggleSaved = React.useCallback((key: string) => {
    setSavedMap((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/search' as never),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Podcast</ThemedText>}
      />

      <View style={styles.modeWrap}>
        <View style={styles.modeTabs}>
          <ModeButton label="Video" active={mediaMode === 'video'} onPress={() => setMediaMode('video')} disabled={!item?.hasVideo} />
          <ModeButton label="Audio" active={mediaMode === 'audio'} onPress={() => setMediaMode('audio')} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (showMiniPlayer ? 118 : 28) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={showsQuery.isRefetching} onRefresh={() => void showsQuery.refetch()} tintColor={theme.primary} />
        }>
        {showsQuery.isLoading ? <ScreenMessage message="Chargement du podcast..." /> : null}
        {showsQuery.isError ? <ScreenMessage message="Impossible de charger ce podcast." /> : null}

        {!showsQuery.isLoading && !showsQuery.isError && item ? (
          <>
            <View style={styles.hero}>
              <ContentImage source={item.imageSource} style={styles.heroImage} />
              <View style={styles.heroOverlay} />

              <View style={styles.heroControls}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: mediaMode === 'video' ? '63%' : '47%' }]} />
                </View>

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
                    <ThemedText style={styles.timeText}>{item.progressLabel}</ThemedText>
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
              <ThemedText style={styles.title}>{item.showTitle}</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.headlineDate }]}>
                {['EMISSION', item.dateLabel.toUpperCase()].join(' | ')}
              </ThemedText>

              <View style={styles.hostCard}>
                <ContentImage source={item.hostAvatar ?? item.imageSource} style={styles.hostAvatar} />
                <View style={styles.hostText}>
                  <ThemedText style={styles.hostName}>{item.hostName.toUpperCase()}</ThemedText>
                  <ThemedText style={styles.hostRole}>{item.hostRole}</ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.description, { color: theme.homeSubtitle }]}>
                {item.description || item.showDescription || 'Aucune description disponible.'}
              </ThemedText>

              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>A decouvrir aussi</ThemedText>
                <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
              </View>

              <View style={styles.relatedList}>
                {relatedItems.map((entry, index) => (
                  <PodcastDiscoveryItem
                    key={entry.key}
                    item={entry}
                    saved={savedMap[entry.key] ?? false}
                    showDivider={index < relatedItems.length - 1}
                    onPress={() => openItem(entry)}
                    onPressSave={() => toggleSaved(entry.key)}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {item && showMiniPlayer ? (
        <View style={[styles.miniPlayerWrap, { bottom: insets.bottom + 12 }]}>
          <View style={styles.miniPlayer}>
            <View style={styles.miniPlayerMain}>
              <ContentImage source={item.imageSource} style={styles.miniPlayerThumb} />
              <ThemedText numberOfLines={2} style={styles.miniPlayerTitle}>
                {item.showTitle}
              </ThemedText>
            </View>

            <View style={styles.miniPlayerActions}>
              <Pressable style={({ pressed }) => [styles.miniPlayerButton, pressed && styles.pressed]} onPress={() => setPlaying((current) => !current)}>
                {playing ? (
                  <Pause size={22} weight="fill" color={Palette.neutral['100']} />
                ) : (
                  <Play size={22} weight="fill" color={Palette.neutral['100']} />
                )}
              </Pressable>
              <Pressable style={({ pressed }) => [styles.miniPlayerButton, pressed && styles.pressed]} onPress={() => setShowMiniPlayer(false)}>
                <X size={20} weight="bold" color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
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

function ScreenMessage({ message }: { message: string }) {
  return (
    <View style={styles.messageWrap}>
      <ThemedText style={styles.messageText}>{message}</ThemedText>
    </View>
  );
}

function PodcastDiscoveryItem({
  item,
  saved,
  showDivider,
  onPress,
  onPressSave,
}: {
  item: PodcastLibraryItem;
  saved: boolean;
  showDivider: boolean;
  onPress: () => void;
  onPressSave: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.discoveryRow,
        showDivider && {
          borderBottomWidth: 1,
          borderBottomColor: theme.homeChipBorder,
        },
      ]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.discoveryMain, pressed && styles.pressed]}>
        <View style={styles.discoveryMediaWrap}>
          <ContentImage source={item.imageSource} style={styles.discoveryMedia} />
          <View style={styles.discoveryPlayBadge}>
            <Play size={14} weight="fill" color={theme.primary} />
          </View>
          <View style={styles.discoveryDuration}>
            <ThemedText style={styles.discoveryDurationText}>{item.durationLabel}</ThemedText>
          </View>
        </View>

        <View style={styles.discoveryText}>
          <ThemedText style={[styles.discoveryDate, { color: theme.headlineDate }]}>{item.dateLabel}</ThemedText>
          <ThemedText numberOfLines={3} style={styles.discoveryTitle}>
            {item.title}
          </ThemedText>
        </View>
      </Pressable>

      <Pressable hitSlop={8} onPress={onPressSave} style={({ pressed }) => [styles.discoverySave, pressed && styles.pressed]}>
        {saved ? (
          <SavedForLaterActiveIcon width={15} height={19} color={theme.primary} />
        ) : (
          <BookmarkSimple size={20} weight="regular" color={theme.primary} />
        )}
      </Pressable>
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
    lineHeight: 22,
    fontWeight: '700',
  },
  modeWrap: {
    backgroundColor: Palette.blue['800'],
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
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
    height: 240,
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,37,96,0.22)',
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
  progressFill: {
    height: 3,
    borderRadius: 999,
    backgroundColor: Palette.red['800'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconControl: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  timePill: {
    minWidth: 118,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    marginTop: -10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#F3F3F5',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 14,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
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
  relatedList: {
    marginTop: -2,
  },
  discoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  discoveryMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discoveryMediaWrap: {
    position: 'relative',
  },
  discoveryMedia: {
    width: 136,
    height: 76,
    borderRadius: 6,
  },
  discoveryPlayBadge: {
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
  discoveryDuration: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discoveryDurationText: {
    color: Palette.neutral['100'],
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },
  discoveryText: {
    flex: 1,
  },
  discoveryDate: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  discoveryTitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  discoverySave: {
    width: 26,
    alignItems: 'flex-end',
  },
  miniPlayerWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  miniPlayer: {
    minHeight: 74,
    borderRadius: 8,
    backgroundColor: '#12244F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  miniPlayerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniPlayerThumb: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  miniPlayerTitle: {
    flex: 1,
    color: Palette.neutral['100'],
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  miniPlayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  miniPlayerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
  pressed: {
    opacity: 0.84,
  },
});
