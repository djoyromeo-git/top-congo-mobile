import type { Href } from 'expo-router';
import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLiveStreamConfigured, toggleLiveAudio, useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

const APP_BAR_LOGO_SOURCE = require('@/assets/images/logos/app-bar-logo.png');
const LIVE_WAVE_SOURCE = require('@/assets/images/live/live-wave.svg');
const WAVE_TILE_WIDTH = 178;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH;

type ExpandableSectionKey = 'podcast' | 'news';

export default function DrawerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const [expandedSections, setExpandedSections] = React.useState<Record<ExpandableSectionKey, boolean>>({
    podcast: false,
    news: false,
  });
  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const isClosingRef = React.useRef(false);

  const isLiveActive = isPlaying || isBuffering;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateX]);

  const closeDrawer = React.useCallback((nextHref?: Href) => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (nextHref) {
        router.replace(nextHref);
        return;
      }

      router.back();
    });
  }, [backdropOpacity, router, translateX]);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });

    return () => subscription.remove();
  }, [closeDrawer]);

  const toggleSection = React.useCallback((key: ExpandableSectionKey) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const handleToggleLive = React.useCallback(() => {
    if (!isLiveStreamConfigured) {
      return;
    }

    void toggleLiveAudio({
      title: program.title,
      artist: program.host,
      albumTitle: program.schedule,
    });
  }, [program.host, program.schedule, program.title]);

  const handleNavigate = React.useCallback((href: Href) => {
    closeDrawer(href);
  }, [closeDrawer]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ presentation: 'transparentModal', animation: 'none' }} />
      <StatusBar style="light" backgroundColor={Palette.blue['800']} />

      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { backgroundColor: theme.surfaceMuted, transform: [{ translateX }] },
        ]}>
        <AppTopBar
          leftAction={{ icon: 'x', onPress: () => closeDrawer(), accessibilityLabel: t('drawer.close') }}
          centerContent={
            <Image
              source={APP_BAR_LOGO_SOURCE}
              style={styles.headerLogo}
              cachePolicy="memory-disk"
              contentFit="contain"
              transition={0}
            />
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.liveBanner}>
            <View style={styles.waveWrap}>
              <Image
                source={LIVE_WAVE_SOURCE}
                style={styles.waveImage}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={0}
              />
              <Image
                source={LIVE_WAVE_SOURCE}
                style={styles.waveImage}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={0}
              />
              <Image
                source={LIVE_WAVE_SOURCE}
                style={styles.waveImage}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={0}
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.liveInfo, pressed && styles.pressed]}
              onPress={() => handleNavigate('/live-player')}>
              {isLiveActive ? (
                <>
                  <View style={styles.liveActiveRow}>
                    <View style={styles.liveDot} />
                    <ThemedText numberOfLines={1} style={styles.liveProgramTitle}>
                      {program.title}
                    </ThemedText>
                  </View>
                  <ThemedText numberOfLines={1} style={styles.liveProgramMeta}>
                    {program.schedule}
                  </ThemedText>
                </>
              ) : (
                <View style={styles.liveListenRow}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveListenText}>{t('drawer.listenLive')}</ThemedText>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleToggleLive}
              disabled={!isLiveStreamConfigured}
              style={({ pressed }) => [
                styles.liveButton,
                !isLiveStreamConfigured && styles.disabled,
                pressed && styles.pressed,
              ]}>
              {isBuffering ? (
                <ActivityIndicator size="small" color={Palette.red['800']} />
              ) : (
                <Entypo
                  name={isLiveActive ? 'controller-paus' : 'controller-play'}
                  size={22}
                  color={Palette.red['800']}
                  style={!isLiveActive ? styles.playIcon : undefined}
                />
              )}
            </Pressable>
          </View>

          <View style={[styles.menuContainer, { borderBottomColor: theme.homeChipBorder }]}>
            <DrawerMenuItem
              icon={<MaterialIcons name="podcasts" size={22} color={theme.homeTitle} />}
              label={t('drawer.podcast')}
              expanded={expandedSections.podcast}
              onPress={() => toggleSection('podcast')}
            />
            {expandedSections.podcast ? (
              <View style={styles.submenu}>
                <DrawerSubItem label={t('drawer.podcastPolitics')} />
                <DrawerSubItem label={t('drawer.podcastEconomyBusiness')} />
                <DrawerSubItem label={t('drawer.podcastSociety')} />
                <DrawerSubItem label={t('drawer.podcastDebates')} />
              </View>
            ) : null}

            <DrawerMenuItem
              icon={<MaterialIcons name="videocam" size={22} color={theme.homeTitle} />}
              label={t('drawer.direct')}
              onPress={() => handleNavigate('/direct')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="television-play" size={22} color={theme.homeTitle} />}
              label={t('drawer.videos')}
              onPress={() => handleNavigate('/emissions')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="newspaper-variant-outline" size={22} color={theme.homeTitle} />}
              label={t('drawer.news')}
              expanded={expandedSections.news}
              onPress={() => toggleSection('news')}
            />
            {expandedSections.news ? (
              <View style={styles.submenu}>
                <DrawerSubItem label={t('drawer.newsEconomy')} />
                <DrawerSubItem label={t('drawer.newsTechnology')} />
                <DrawerSubItem label={t('drawer.newsSecurity')} />
                <DrawerSubItem label={t('drawer.newsPolitics')} />
              </View>
            ) : null}

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="calendar-month-outline" size={22} color={theme.homeTitle} />}
              label={t('drawer.programs')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="seal" size={21} color={theme.homeTitle} />}
              label={t('drawer.premium')}
              onPress={() => handleNavigate('/premium')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="bell-outline" size={22} color={theme.homeTitle} />}
              label={t('drawer.notifications')}
            />

            <DrawerMenuItem
              icon={<FontAwesome5 name="bookmark" size={18} color={theme.homeTitle} />}
              label={t('drawer.saved')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="file-document-outline" size={22} color={theme.homeTitle} />}
              label={t('drawer.legal')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="account-circle-outline" size={23} color={theme.homeTitle} />}
              label={t('drawer.account')}
            />

            <DrawerMenuItem
              icon={<MaterialCommunityIcons name="logout-variant" size={22} color={theme.homeTitle} />}
              label={t('drawer.logout')}
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
        <View style={styles.menuIcon}>{icon}</View>
        <ThemedText style={[styles.menuLabel, { color: theme.homeTitle }]}>{label}</ThemedText>
      </View>

      {hasChevron ? (
        <Feather name={expanded ? 'chevron-down' : 'chevron-right'} size={21} color={theme.homeTitle} />
      ) : null}
    </Pressable>
  );
}

function DrawerSubItem({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.submenuItem, { borderBottomColor: theme.homeChipBorder }]}>
      <ThemedText style={[styles.submenuLabel, { color: theme.homeSubtitle }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 9, 24, 0.28)',
  },
  panel: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
    elevation: 20,
  },
  headerLogo: {
    width: 119,
    height: 35,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 44,
  },
  liveBanner: {
    minHeight: 62,
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
  liveActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: Palette.neutral['100'],
  },
  liveListenText: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 500,
  },
  liveProgramTitle: {
    flex: 1,
    color: Palette.neutral['100'],
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 500,
  },
  liveProgramMeta: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 15,
    fontWeight: 500,
    paddingLeft: 17,
  },
  liveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.neutral['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
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
  menuIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  submenu: {
    paddingLeft: 10,
  },
  submenuItem: {
    minHeight: 54,
    justifyContent: 'center',
    borderBottomWidth: 1,
    paddingLeft: 38,
  },
  submenuLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
  },
});
