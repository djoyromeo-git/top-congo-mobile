import React from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SkeletonBlockProps = {
  style?: StyleProp<ViewStyle>;
  color?: string;
  minOpacity?: number;
  maxOpacity?: number;
};

export function SkeletonBlock({
  style,
  color,
  minOpacity = 0.55,
  maxOpacity = 0.95,
}: SkeletonBlockProps) {
  const theme = useTheme();
  const opacity = React.useRef(new Animated.Value(minOpacity)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: maxOpacity,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: minOpacity,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [maxOpacity, minOpacity, opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          backgroundColor: color ?? theme.homeChipBorder,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
  },
});
