import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';

import classes from './animated-icon.module.css';
const DURATION = 300;
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
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [DURATION / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
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

      <Animated.View style={styles.background} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={SPLASH_LOGO_SOURCE} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
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
  },
  image: {
    position: 'absolute',
    width: 102,
    height: 50,
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#174197',
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
