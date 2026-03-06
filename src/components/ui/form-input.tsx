import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export type FormInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorText?: string;
  showPasswordToggle?: boolean;
};

export function FormInput({
  label,
  leftAccessory,
  rightAccessory,
  containerStyle,
  inputStyle,
  errorText,
  secureTextEntry,
  showPasswordToggle = false,
  ...inputProps
}: FormInputProps) {
  const theme = useTheme();
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const hidesText = useMemo(() => {
    if (!secureTextEntry) return false;
    if (!showPasswordToggle) return true;
    return !isPasswordVisible;
  }, [isPasswordVisible, secureTextEntry, showPasswordToggle]);

  return (
    <View style={styles.wrapper}>
      {!!label && <ThemedText style={styles.label}>{label}</ThemedText>}

      <View style={[styles.inputRow, { borderColor: theme.border }, containerStyle]}>
        {!!leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}

        <TextInput
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, inputStyle]}
          secureTextEntry={hidesText}
          {...inputProps}
        />

        {showPasswordToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((value) => !value)}
            style={({ pressed }) => [styles.rightAccessory, pressed && styles.pressed]}>
            <Feather name={hidesText ? 'eye-off' : 'eye'} size={21} color={theme.text} />
          </Pressable>
        ) : (
          !!rightAccessory && <View style={styles.rightAccessory}>{rightAccessory}</View>
        )}
      </View>

      {!!errorText && (
        <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errorText}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  inputRow: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: 'transparent',
  },
  leftAccessory: {
    marginRight: Spacing.two,
  },
  rightAccessory: {
    marginLeft: Spacing.two,
    minWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontFamily: Fonts.sans,
    flex: 1,
    minHeight: 46,
    fontSize: 19 / 1.2,
    lineHeight: 25 / 1.2,
    fontWeight: 500,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.75,
  },
});
