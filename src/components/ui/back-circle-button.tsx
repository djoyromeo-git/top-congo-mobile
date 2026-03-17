import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';

import { useTheme } from '@/hooks/use-theme';

type BackCircleButtonProps = Omit<PressableProps, 'style'> & {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BackCircleButton({ size = 42, style, ...props }: BackCircleButtonProps) {
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
          backgroundColor: theme.backButtonBackground,
        },
        pressed && styles.pressed,
        style,
      ]}
      {...props}>
      <ArrowLeft size={28} weight="bold" color={theme.primary} />
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
