import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BackCircleButtonProps = Omit<PressableProps, 'style'> & {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BackCircleButton({ size = 56, style, ...props }: BackCircleButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.backgroundElement,
        },
        pressed && styles.pressed,
        style,
      ]}
      {...props}>
      <Feather name="arrow-left" size={28} color={theme.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

