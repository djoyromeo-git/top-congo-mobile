import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type AppButtonVariant = 'primary' | 'neutral' | 'ghost';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: AppButtonVariant;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  variant = 'primary',
  leftAccessory,
  rightAccessory,
  disabled,
  style,
  labelStyle,
  fullWidth = true,
  ...props
}: AppButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'neutral'
        ? theme.backgroundElement
        : 'transparent';

  const borderColor = variant === 'ghost' ? theme.border : backgroundColor;
  const textColor = variant === 'primary' ? Palette.neutral['100'] : theme.text;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: disabled ? theme.backgroundElement : backgroundColor,
          borderColor,
        },
        variant === 'ghost' && styles.ghostButton,
        variant === 'primary' && !disabled && styles.primaryShadow,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...props}>
      <View style={styles.content}>
        {!!leftAccessory && <View style={styles.accessory}>{leftAccessory}</View>}
        <ThemedText style={[styles.label, { color: disabled ? theme.textSecondary : textColor }, labelStyle]}>
          {label}
        </ThemedText>
        {!!rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 49,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  accessory: {
    width: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 500,
  },
  primaryShadow: {
    shadowColor: Palette.blue['800'],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: {
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
});

