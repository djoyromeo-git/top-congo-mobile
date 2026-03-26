import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Palette, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/presentation/use-auth-session';
import { selectTopicChipOptions, useTopicsOptions } from '@/features/topics/infrastructure/fetch-topics-options';
import { useTheme } from '@/hooks/use-theme';
import { requestDirectMode } from '@/services/direct-mode-intent';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import {
  ApplePodcastsLogo,
  BellRinging,
  BookmarkSimple,
  CalendarDots,
  CaretDown,
  CaretRight,
  FileText,
  MicrophoneStage,
  MonitorPlay,
  Newspaper,
  Play,
  SealCheck,
  SignOut,
  Stop,
  Television,
  UserCircle,
  VideoCamera,
  X,
} from 'phosphor-react-native';

type ExpandableSectionKey = 'podcast' | 'news';

const APP_BAR_LOGO_SOURCE = require('@/assets/images/logos/app-bar-logo.png');
const LIVE_WAVE_SOURCE = require('@/assets/images/live/live-wave.svg');
const WEB_LIVE_WAVE_SOURCE = require('@/assets/images/waveform-top-congo.png');
const WAVE_TILE_WIDTH = 178;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH;

type DrawerPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DrawerPanel({ isOpen, onClose }: DrawerPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { signOut } = useAuthSession();
  const isWeb = Platform.OS === 'web';
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const topicsQuery = useTopicsOptions();
  const [expandedSections, setExpandedSections] = React.useState<Record<ExpandableSectionKey, boolean>>({
    podcast: false,
    news: false,
  });

  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const waveShift = React.useRef(new Animated.Value(0)).current;
  const waveOpacity = React.useRef(new Animated.Value(0.26)).current;

  const isLiveActive = isPlaying || isBuffering;
  const topicLabels = React.useMemo(
    () => selectTopicChipOptions(topicsQuery.data ?? []).map((item) => item.label),
    [topicsQuery.data]
  );

  React.useEffect(() => {
    void Asset.loadAsync([APP_BAR_LOGO_SOURCE, LIVE_WAVE_SOURCE, WEB_LIVE_WAVE_SOURCE]);
  }, []);

  React.useEffect(() => {
    const toValue = isOpen ? 0 : -DRAWER_WIDTH;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 240,
        easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        easing: isOpen ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, isOpen, translateX]);

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isOpen) return false;
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isWeb) return;

    let shiftAnimation: Animated.CompositeAnimation | null = null;
    let opacityAnimation: Animated.CompositeAnimation | null = null;

    const active = isLiveActive && isOpen;
    if (active) {
      waveShift.setValue(0);
      shiftAnimation = Animated.loop(
        Animated.timing(waveShift, {
          toValue: -WAVE_TILE_WIDTH,
          duration: isBuffering ? 1200 : 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveOpacity, {
            toValue: 0.42,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(waveOpacity, {
            toValue: 0.24,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      shiftAnimation.start();
      opacityAnimation.start();
    } else {
      waveShift.stopAnimation();
      waveOpacity.stopAnimation();
      waveShift.setValue(0);
      Animated.timing(waveOpacity, {
        toValue: 0.26,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    return () => {
      shiftAnimation?.stop();
      opacityAnimation?.stop();
    };
  }, [isBuffering, isLiveActive, isOpen, isWeb, waveOpacity, waveShift]);

  const toggleSection = React.useCallback((key: ExpandableSectionKey) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const handleToggleLive = React.useCallback(() => {
    if (!isLiveStreamConfigured) return;
    void toggleLiveAudio({
      title: program.title,
      artist: program.host,
      albumTitle: program.schedule,
    });
  }, [program.host, program.schedule, program.title]);

  const handleNavigate = React.useCallback(
    (href: string) => {
      onClose();
      router.push(href as any);
    },
    [onClose, router]
  );

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: theme.surfaceMuted,
            transform: [{ translateX }],
          },
        ]}>
        <AppTopBar
          leftAction={{
            icon: <X size={22} weight="bold" color={theme.onPrimary} />,
            onPress: onClose,
            accessibilityLabel: t('drawer.close'),
          }}
          centerContent={
            <Image source={APP_BAR_LOGO_SOURCE} style={styles.headerLogo} cachePolicy="memory-disk" priority="high" contentFit="contain" transition={0} />
          }
        />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.liveBanner}>
            <Animated.View
              style={[
                styles.waveWrap,
                {
                  opacity: waveOpacity,
                  transform: [{ translateX: waveShift }],
                },
              ]}>
              <Image source={LIVE_WAVE_SOURCE} style={styles.waveImage} cachePolicy="memory-disk" priority="high" contentFit="cover" transition={0} />
              <Image source={LIVE_WAVE_SOURCE} style={styles.waveImage} cachePolicy="memory-disk" priority="high" contentFit="cover" transition={0} />
              <Image source={LIVE_WAVE_SOURCE} style={styles.waveImage} cachePolicy="memory-disk" priority="high" contentFit="cover" transition={0} />
            </Animated.View>

            <Pressable
              style={({ pressed }) => [styles.liveInfo, pressed && styles.pressed]}
              onPress={() => {
                requestDirectMode('audio');
                handleNavigate('/direct');
              }}>
              {isLiveActive ? (
                <>
                  <ThemedText numberOfLines={1} style={styles.liveProgramTitle}>
                    {program.title}
                  </ThemedText>
                  {program.schedule ? (
                    <ThemedText numberOfLines={1} style={styles.liveProgramMeta}>
                      {program.schedule}
                    </ThemedText>
                  ) : null}
                </>
              ) : (
                <View style={styles.liveListenRow}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveListenText}>{t('drawer.listenLive')}</ThemedText>
                </View>
              )}
            </Pressable>

            <Pressable onPress={handleToggleLive} disabled={!isLiveStreamConfigured}>
              {isBuffering || isStarting ? (
                <ActivityIndicator size="small" color={Palette.red['800']} />
              ) : isLiveActive ? (
                <Stop size={32} weight="fill" color={Palette.neutral['100']} />
              ) : (
                <View style={[styles.liveButton, !isLiveStreamConfigured && styles.disabled]}>
                  <Play size={18} weight="fill" color={Palette.red['800']} style={styles.playIcon} />
                </View>
              )}
            </Pressable>
          </View>

          <View style={[styles.menuContainer, { borderBottomColor: theme.homeChipBorder }]}>
            <DrawerMenuItem
              icon={<Newspaper size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.news')}
              expanded={expandedSections.news}
              onPress={() => toggleSection('news')}
            />
            {expandedSections.news ? (
              <View style={styles.submenu}>
                {topicLabels.map((label) => (
                  <DrawerSubItem key={`news-${label}`} label={label} />
                ))}
              </View>
            ) : null}

            <DrawerMenuItem
              icon={<ApplePodcastsLogo size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.podcast')}
              expanded={expandedSections.podcast}
              onPress={() => toggleSection('podcast')}
            />
            {expandedSections.podcast ? (
              <View style={styles.submenu}>
                {topicLabels.map((label) => (
                  <DrawerSubItem key={`podcast-${label}`} label={label} />
                ))}
              </View>
            ) : null}

            <DrawerMenuItem
              icon={<MonitorPlay size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.videos')}
              onPress={() => handleNavigate('/emissions')}
            />

            <DrawerMenuItem
              icon={<MicrophoneStage size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.emissions')}
              onPress={() => handleNavigate('/emissions')}
            />

            <DrawerMenuItem
              icon={<VideoCamera size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.direct')}
              onPress={() => handleNavigate('/direct')}
            />

            <DrawerMenuItem icon={<CalendarDots size={22} weight="fill" color={theme.homeTitle} />} label={t('drawer.programs')} />

            <DrawerMenuItem
              icon={<SealCheck size={21} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.premium')}
              onPress={() => handleNavigate('/premium')}
            />

            <DrawerMenuItem
              icon={<Television size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.multilive') ?? 'Multilive'}
            />

            <DrawerMenuItem icon={<BellRinging size={22} weight="fill" color={theme.homeTitle} />} label={t('drawer.notifications')} />

            <DrawerMenuItem
              icon={<BookmarkSimple size={18} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.saved')}
            />

            <DrawerMenuItem icon={<FileText size={22} weight="fill" color={theme.homeTitle} />} label={t('drawer.legal')} />

            <DrawerMenuItem icon={<UserCircle size={23} weight="fill" color={theme.homeTitle} />} label={t('drawer.account')} />

            <DrawerMenuItem
              icon={<SignOut size={22} weight="fill" color={theme.homeTitle} />}
              label={t('drawer.logout')}
              onPress={() => {
                void (async () => {
                  await signOut();
                  onClose();
                  router.replace('/onboarding');
                })();
              }}
              showDivider={false}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function DrawerMenuItem({
  icon,
  label,
  expanded,
  onPress,
  showDivider = true,
}: {
  icon: React.ReactNode;
  label: string;
  expanded?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
}) {
  const theme = useTheme();
  const hasChevron = typeof expanded === 'boolean';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        showDivider && { borderBottomWidth: 1, borderBottomColor: theme.homeChipBorder },
        pressed && styles.pressed,
      ]}>
      <View style={styles.menuItemLeft}>
        {icon}
        <ThemedText numberOfLines={1} style={[styles.menuLabel, { color: theme.homeTitle }]}>
          {label}
        </ThemedText>
      </View>

      {hasChevron ? (
        expanded ? (
          <CaretDown size={21} weight="bold" color={theme.homeTitle} />
        ) : (
          <CaretRight size={21} weight="bold" color={theme.homeTitle} />
        )
      ) : null}
    </Pressable>
  );
}

function DrawerSubItem({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.subItem, { borderBottomColor: theme.homeChipBorder }]}>
      <ThemedText style={[styles.subItemLabel, { color: theme.homeTitle }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: -4, height: 0 },
    elevation: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  liveBanner: {
    minHeight: 63,
    backgroundColor: Palette.red['800'],
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: 12,
    gap: 10,
  },
  waveWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    width: WAVE_TILE_WIDTH * 3,
    opacity: 0.26,
  },
  waveImage: {
    width: WAVE_TILE_WIDTH,
    height: '100%',
  },
  liveInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  liveListenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveProgramTitle: {
    flex: 1,
    color: Palette.neutral['100'],
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  liveProgramMeta: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    paddingLeft: 17,
  },
  liveButton: {
    width: 37,
    height: 37,
    borderRadius: 22,
    backgroundColor: Palette.neutral['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  liveListenText: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  liveDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: Palette.neutral['100'],
  },
  menuContainer: {
    marginHorizontal: 10,
    borderBottomWidth: 1,
  },
  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  submenu: {
    paddingLeft: 10,
  },
  subItem: {
    minHeight: 54,
    paddingHorizontal: 32,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  subItemLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  headerLogo: {
    width: 119,
    height: 35,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
