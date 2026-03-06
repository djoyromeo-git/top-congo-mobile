import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;
const SPLASH_HIDE_DELAY_AFTER_LOGO_MS = 500;
const SPLASH_FALLBACK_HIDE_MS = 4000;
const SPLASH_LOGO_SOURCE = require('../../assets/expo.icon/Assets/logo-all-white.png');

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setVisible(false);
    }, SPLASH_FALLBACK_HIDE_MS);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (!logoLoaded) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, SPLASH_HIDE_DELAY_AFTER_LOGO_MS);

    return () => clearTimeout(timer);
  }, [logoLoaded]);

  if (!visible) return null;

  return (
    <View style={styles.splashOverlay}>
      <Image
        source={SPLASH_LOGO_SOURCE}
        style={styles.splashLogo}
        contentFit="contain"
        onLoad={() => setLogoLoaded(true)}
        onError={() => setLogoLoaded(true)}
      />
      <View style={styles.loaderSlot}>
        {logoLoaded ? <ActivityIndicator size="large" color="#FFFFFF" style={styles.splashLoader} /> : null}
      </View>
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={SPLASH_LOGO_SOURCE} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    position: 'absolute',
    width: 102,
    height: 50,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, ${Palette.blue['800']}, ${Palette.blue['600']})`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.blue['800'],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  splashLogo: {
    width: 220,
    height: 108,
  },
  loaderSlot: {
    marginTop: 46,
    minHeight: 36,
    justifyContent: 'center',
  },
  splashLoader: {
    transform: [{ scale: 1.6 }],
    opacity: 0.9,
  },
});
