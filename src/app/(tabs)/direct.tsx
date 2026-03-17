import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  CaretDown,
  DotsThreeVertical,
  Pause,
  Play,
  PlayCircle,
  SpeakerHigh,
  SpeakerX,
} from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { TabShell } from '@/components/ui/tab-shell';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { consumeRequestedDirectMode } from '@/services/direct-mode-intent';
import {
  isLiveStreamConfigured,
  toggleLiveAudio,
  useLiveAudioStatus,
  useLiveProgramInfo,
} from '@/services/live-audio';

const DIRECT_HERO_SOURCE = require('@/assets/images/home/concert.png');
const DIRECT_PROGRESS_RATIO = 0.84;

type DirectMode = 'video' | 'audio';

type DirectScheduleItem = {
  key: string;
  startTime: string;
  endTime: string;
  title: string;
  active?: boolean;
};

function resolveDirectModeParam(value: string | string[] | undefined): DirectMode | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'audio' || normalized === 'video' ? normalized : null;
}

export default function DirectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const theme = useTheme();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const program = useLiveProgramInfo();
  const [mode, setMode] = React.useState<DirectMode>('video');
  const [isMuted, setIsMuted] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const directSchedule = React.useMemo<DirectScheduleItem[]>(
    () => [
      {
        key: 'journal',
        startTime: '19:00',
        endTime: '19:20',
        title: t('direct.scheduleJournal'),
        active: true,
      },
      {
        key: 'parlons-en',
        startTime: '19:20',
        endTime: '19:30',
        title: t('direct.scheduleParlonsEn'),
      },
      {
        key: 'infos-sport',
        startTime: '19:20',
        endTime: '19:30',
        title: t('direct.scheduleInfosSport'),
      },
      {
        key: 'magazine-debat',
        startTime: '19:20',
        endTime: '19:30',
        title: t('direct.scheduleMagazineDebat'),
      },
    ],
    [t]
  );

  const directMetadata = React.useMemo(
    () => ({
      title: program.title,
      ...(program.host ? { artist: program.host } : {}),
      ...(program.schedule ? { albumTitle: program.schedule } : {}),
    }),
    [program.host, program.schedule, program.title]
  );

  useFocusEffect(
    React.useCallback(() => {
      const requestedMode = consumeRequestedDirectMode();
      if (requestedMode) {
        setMode(requestedMode);
      }
    }, [])
  );

  React.useEffect(() => {
    const requestedMode = resolveDirectModeParam(params.mode);
    if (!requestedMode) {
      return;
    }

    setMode(requestedMode);
  }, [params.mode]);

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }, [router]);

  const handleTogglePlayback = React.useCallback(() => {
    if (!isLiveStreamConfigured) {
      return;
    }

    void toggleLiveAudio(directMetadata);
  }, [directMetadata]);

  const playbackIcon: RoundIcon = isPlaying && !isBuffering ? 'pause' : 'play';

  return (
    <TabShell>
      {({ liveCardBottom }) => (
        <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
          <StatusBar style="light" backgroundColor={Palette.red['800']} />

          <View style={styles.topSection}>
          <AppTopBar
            leftAction={{
              icon: <CaretDown size={22} weight="bold" color={Palette.neutral['100']} />,
              onPress: handleBack,
              accessibilityLabel: t('direct.back'),
            }}
            rightAction={{
              icon: <DotsThreeVertical size={22} weight="bold" color={Palette.neutral['100']} />,
              onPress: () => router.push('/drawer'),
              accessibilityLabel: t('direct.more'),
            }}
              style={styles.topBar}
              centerContent={<ThemedText style={styles.headerTitle}>{t('direct.title')}</ThemedText>}
            />

            <View style={styles.modeSwitch}>
              <DirectModeButton
                label={t('direct.videoMode')}
                active={mode === 'video'}
                onPress={() => setMode('video')}
              />
              <DirectModeButton
                label={t('direct.audioMode')}
                active={mode === 'audio'}
                onPress={() => setMode('audio')}
              />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: liveCardBottom }]}>

            <View style={styles.playerSurface}>
              <View style={styles.mediaFrame}>
                <Image source={DIRECT_HERO_SOURCE} style={styles.mediaBackdrop} contentFit="cover" transition={0} />
                <Image source={DIRECT_HERO_SOURCE} style={styles.mediaImage} contentFit="cover" transition={0} />
                <View style={styles.mediaOverlay} />
                <View style={styles.mediaBottomShade} />
                <View style={styles.mediaControlsOverlay}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${DIRECT_PROGRESS_RATIO * 100}%` }]} />
                  </View>

                  <View style={styles.controlsRow}>
                    <RoundIconButton
                      icon={playbackIcon}
                      accessibilityLabel={isPlaying ? t('direct.pause') : t('direct.play')}
                      onPress={handleTogglePlayback}
                      disabled={!isLiveStreamConfigured}
                    />

                    <RoundIconButton
                      icon={isMuted ? 'volume-x' : 'volume-high'}
                      accessibilityLabel={isMuted ? t('direct.unmute') : t('direct.mute')}
                      onPress={() => setIsMuted(current => !current)}
                    />

                    <View style={styles.livePill}>
                      <View style={styles.liveDot} />
                      <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.livePillText}>
                        {t('direct.badge')}
                      </ThemedText>
                    </View>

                    <View style={styles.controlsSpacer} />

                    <RoundIconButton
                      icon={isExpanded ? 'collapse' : 'expand'}
                      accessibilityLabel={isExpanded ? t('direct.collapse') : t('direct.expand')}
                      onPress={() => setIsExpanded(current => !current)}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.scheduleSection, { backgroundColor: theme.surfaceMuted }]}>
              <ThemedText style={styles.scheduleHeading}>{t('direct.upNext')}</ThemedText>
              <View style={[styles.scheduleDivider, { backgroundColor: theme.border }]} />

              <View style={styles.scheduleList}>
                <View style={[styles.scheduleRailContinuous, { backgroundColor: theme.border }]} />

                {directSchedule.map(item => (
                  <View key={item.key} style={styles.scheduleRow}>
                    <View style={styles.scheduleTimeColumn}>
                      <ThemedText style={styles.scheduleStartTime}>{item.startTime}</ThemedText>
                      <ThemedText style={[styles.scheduleEndTime, { color: theme.textSecondary }]}>
                        {item.endTime}
                      </ThemedText>
                    </View>

                    <View style={styles.scheduleRailColumn}>
                      {item.active ? (
                        <View style={styles.scheduleActiveMarker}>
                          <Play size={12} weight="fill" color={Palette.blue['800']} />
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.scheduleCard, item.active ? styles.scheduleCardActive : styles.scheduleCardIdle]}>
                      <ThemedText
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={[styles.scheduleCardText, item.active && styles.scheduleCardTextActive]}>
                        {item.title}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </TabShell>
  );
}

function DirectModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.modeButtonText, active ? styles.modeButtonTextActive : styles.modeButtonTextInactive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type RoundIcon = 'play' | 'pause' | 'volume-high' | 'volume-x' | 'expand' | 'collapse';

function RoundIconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
}: {
  icon: RoundIcon;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && styles.iconButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {{
        play: <Play size={20} weight="fill" color={Palette.neutral['100']} />,
        pause: <Pause size={20} weight="fill" color={Palette.neutral['100']} />,
        'volume-high': <SpeakerHigh size={20} weight="bold" color={Palette.neutral['100']} />,
        'volume-x': <SpeakerX size={20} weight="bold" color={Palette.neutral['100']} />,
        expand: <ArrowsOutSimple size={20} weight="bold" color={Palette.neutral['100']} />,
        collapse: <ArrowsInSimple size={20} weight="bold" color={Palette.neutral['100']} />,
      }[icon]}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: Palette.red['800'],
    paddingBottom: 14,
  },
  topBar: {
    backgroundColor: Palette.red['800'],
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  modeSwitch: {
    marginHorizontal: Spacing.three,
    marginTop: 10,
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#CA2940',
  },
  modeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modeButtonActive: {
    backgroundColor: Palette.neutral['100'],
  },
  modeButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  modeButtonTextActive: {
    color: Palette.red['800'],
  },
  modeButtonTextInactive: {
    color: Palette.neutral['100'],
  },
  playerSurface: {
    backgroundColor: Palette.blueShade['200'],
  },
  mediaFrame: {
    height: 212,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Palette.blueShade['200'],
  },
  mediaBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
    transform: [{ scale: 1.2 }],
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 22, 61, 0.20)',
  },
  mediaBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 106,
    backgroundColor: 'rgba(3, 12, 33, 0.42)',
  },
  mediaControlsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(214, 218, 228, 0.22)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.red['800'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  livePill: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.red['800'],
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Palette.neutral['100'],
  },
  livePillText: {
    color: Palette.neutral['100'],
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  controlsSpacer: {
    flex: 1,
  },
  scheduleSection: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: 20,
  },
  scheduleList: {
    position: 'relative',
  },
  scheduleHeading: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
    color: '#282828',
  },
  scheduleDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  scheduleTimeColumn: {
    width: 50,
    paddingTop: 8,
  },
  scheduleStartTime: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
    color: '#202020',
  },
  scheduleEndTime: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  scheduleRailColumn: {
    width: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleRailContinuous: {
    position: 'absolute',
    top: 0,
    bottom: 12,
    left: 58,
    width: 2,
    borderRadius: 999,
  },
  scheduleActiveMarker: {
    width: 16,
    height: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.neutral['100'],
  },
  scheduleCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  scheduleCardActive: {
    backgroundColor: '#DCE3EF',
  },
  scheduleCardIdle: {
    backgroundColor: '#E7E7E7',
  },
  scheduleCardText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: 700,
    color: '#343434',
    textTransform: 'uppercase',
  },
  scheduleCardTextActive: {
    color: Palette.blue['800'],
  },
  pressed: {
    opacity: 0.82,
  },
});
