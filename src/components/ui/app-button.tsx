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
type AppButtonSize = 'sm' | 'md' | 'lg';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
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
  const buttonSizeStyle = size === 'sm' ? styles.buttonSm : size === 'lg' ? styles.buttonLg : styles.buttonMd;
  const labelSizeStyle = size === 'sm' ? styles.labelSm : size === 'lg' ? styles.labelLg : styles.labelMd;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        buttonSizeStyle,
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
        <ThemedText
          style={[
            styles.label,
            labelSizeStyle,
            { color: disabled ? theme.textSecondary : textColor },
            labelStyle,
          ]}>
          {label}
        </ThemedText>
        {!!rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    alignSelf: 'stretch',
  },
  buttonSm: {
    minHeight: 40,
    borderRadius: 5,
  },
  buttonMd: {
    minHeight: 46,
    borderRadius: 5,
  },
  buttonLg: {
    minHeight: 58,
    borderRadius: 11,
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
    fontWeight: 500,
  },
  labelSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  labelMd: {
    fontSize: 14,
    lineHeight: 24,
  },
  labelLg: {
    fontSize: 20 / 1.2,
    lineHeight: 28 / 1.2,
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
