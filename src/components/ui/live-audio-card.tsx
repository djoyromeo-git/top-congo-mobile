import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Pause, Play } from 'phosphor-react-native';

import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SkeletonBlock } from './skeleton-block';
import { ThemedText } from '../themed-text';

const WAVE_TILE_WIDTH = 178;
const LIVE_WAVE_SOURCE = require('@/assets/images/live/live-wave.svg');
const WEB_LIVE_WAVE_SOURCE = require('@/assets/images/waveform-top-congo.png');

type LiveAudioCardProps = {
  title: string;
  subtitle?: string;
  onPressCard?: () => void;
  onPressPlay?: () => void;
  isPlaying?: boolean;
  isBuffering?: boolean;
  isStarting?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function LiveAudioCard({
  title,
  subtitle,
  onPressCard,
  onPressPlay,
  isPlaying = false,
  isBuffering = false,
  isStarting = false,
  disabled = false,
  loading = false,
}: LiveAudioCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  const waveShift = React.useRef(new Animated.Value(0)).current;
  const waveOpacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (isWeb) {
      return;
    }

    let shiftAnimation: Animated.CompositeAnimation | null = null;
    let opacityAnimation: Animated.CompositeAnimation | null = null;

    const isActive = !disabled && (isPlaying || isBuffering || isStarting);

    if (isActive) {
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
        toValue: 0.3,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    return () => {
      shiftAnimation?.stop();
      opacityAnimation?.stop();
    };
  }, [disabled, isPlaying, isBuffering, isStarting, isWeb, waveOpacity, waveShift]);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingWaveOverlay} />

        <View style={styles.content}>
          <View style={styles.infoPressable}>
            <View style={[styles.liveBadge, { backgroundColor: theme.liveBadgeBackground }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.onPrimary }]} />
              <SkeletonBlock style={styles.loadingBadgeText} color="rgba(255,255,255,0.92)" />
            </View>
            <SkeletonBlock style={styles.loadingTitle} color="rgba(255,255,255,0.92)" />
            <SkeletonBlock style={styles.loadingSubtitle} color="rgba(255,255,255,0.82)" />
          </View>

          <View style={styles.playButton}>
            <Play size={22} weight="fill" color={Palette.red['800']} style={styles.playIcon} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      {isWeb ? (
        <View style={styles.webWaveWrap}>
          <Image
            source={WEB_LIVE_WAVE_SOURCE}
            style={styles.webWaveImage}
            cachePolicy="memory-disk"
            contentFit="cover"
            transition={0}
          />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.waveWrap,
            {
              opacity: waveOpacity,
              transform: [{ translateX: waveShift }],
            },
          ]}>
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
        </Animated.View>
      )}

      <View style={styles.content}>
        <Pressable
          disabled={!onPressCard}
          onPress={onPressCard}
          style={({ pressed }) => [styles.infoPressable, pressed && styles.pressed]}>
          <View>
            <View style={[styles.liveBadge, { backgroundColor: theme.liveBadgeBackground }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.onPrimary }]} />
              <ThemedText style={[styles.liveText, { color: theme.onPrimary }]}>{t('auth.liveBadge')}</ThemedText>
            </View>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {/* {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>} */}
          </View>
        </Pressable>

        <Pressable
          disabled={disabled}
          onPress={onPressPlay}
          style={({ pressed }) => [styles.playButton, disabled && styles.disabled, pressed && styles.pressed]}>
          {isBuffering || isStarting ? (
            <ActivityIndicator size="small" color={Palette.red['800']} />
          ) : isPlaying ? (
            <Pause size={22} weight="fill" color={Palette.red['800']} />
          ) : (
            <Play size={22} weight="fill" color={Palette.red['800']} style={styles.playIcon} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 80,
    backgroundColor: Palette.red['800'],
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  waveWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    overflow: 'hidden',
    width: WAVE_TILE_WIDTH * 3,
  },
  waveImage: {
    width: WAVE_TILE_WIDTH,
    height: '100%',
  },
  webWaveWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
  webWaveImage: {
    width: '100%',
    height: '100%',
  },
  loadingWaveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  infoPressable: {
    flex: 1,
    paddingVertical: 2,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    gap: 3,
    marginBottom: Spacing.half,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  liveText: {
    color: Palette.neutral['100'],
    fontSize: 7,
    lineHeight: 12,
    fontWeight: 700,
  },
  loadingBadgeText: {
    width: 24,
    height: 7,
    borderRadius: 999,
  },
  title: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 17,
    fontWeight: 500,
  },
  loadingTitle: {
    width: '76%',
    height: 11,
    borderRadius: 999,
    marginTop: 2,
  },
  loadingSubtitle: {
    width: '68%',
    height: 11,
    borderRadius: 999,
    marginTop: 8,
  },
  subtitle: {
    color: Palette.neutral['100'],
    opacity: 0.85,
    fontSize: 15,
    lineHeight: 19,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Palette.neutral['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
