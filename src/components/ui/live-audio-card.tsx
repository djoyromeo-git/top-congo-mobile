import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type LiveAudioCardProps = {
  title: string;
  subtitle?: string;
  onPressPlay?: () => void;
  isPlaying?: boolean;
  isBuffering?: boolean;
  disabled?: boolean;
};

export function LiveAudioCard({
  title,
  subtitle,
  onPressPlay,
  isPlaying = false,
  isBuffering = false,
  disabled = false,
}: LiveAudioCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const waveShift = React.useRef(new Animated.Value(0)).current;
  const waveOpacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    let shiftAnimation: Animated.CompositeAnimation | null = null;
    let opacityAnimation: Animated.CompositeAnimation | null = null;

    const isActive = !disabled && (isPlaying || isBuffering);

    if (isActive) {
      shiftAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveShift, {
            toValue: -24,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(waveShift, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveOpacity, {
            toValue: 0.45,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(waveOpacity, {
            toValue: 0.25,
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

      Animated.timing(waveShift, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

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
  }, [disabled, isPlaying, isBuffering, waveOpacity, waveShift]);

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <Animated.View
        style={[
          styles.waveWrap,
          {
            opacity: waveOpacity,
            transform: [{ translateX: waveShift }],
          },
        ]}>
        <Image source={require('@/assets/images/live/live-wave.svg')} style={styles.waveImage} contentFit="cover" />
        <Image source={require('@/assets/images/live/live-wave.svg')} style={styles.waveImage} contentFit="cover" />
      </Animated.View>

        <View style={styles.content}>
        <View>
          <View style={[styles.liveBadge, { backgroundColor: theme.liveBadgeBackground }]}>
            <View style={[styles.liveDot, { backgroundColor: theme.onPrimary }]} />
            <ThemedText style={[styles.liveText, { color: theme.onPrimary }]}>{t('auth.liveBadge')}</ThemedText>
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {/* {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>} */}
        </View>

        <Pressable
          disabled={disabled}
          onPress={onPressPlay}
          style={({ pressed }) => [styles.playButton, disabled && styles.disabled, pressed && styles.pressed]}>
          {isBuffering ? (
            <ActivityIndicator size="small" color={Palette.red['800']} />
          ) : (
            <Entypo
              name={isPlaying ? 'controller-paus' : 'controller-play'}
              size={22}
              color={Palette.red['800']}
              style={!isPlaying ? styles.playIcon : undefined}
            />
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
  },
  waveImage: {
    flex: 1,
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
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
  title: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 17,
    fontWeight: 500,
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
