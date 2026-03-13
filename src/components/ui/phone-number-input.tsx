import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type PhoneNumberInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  errorText?: string;
  countryCode?: string;
};

export function PhoneNumberInput({
  label,
  value,
  onChangeText,
  placeholder,
  errorText,
  countryCode = '+243',
}: PhoneNumberInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <View style={styles.row}>
        <Pressable style={[styles.countryBox, { borderColor: theme.inputBorder }]} onPress={() => {}}>
          <ThemedText style={styles.countryText}>{countryCode}</ThemedText>
          <Feather name="chevron-down" size={18} color={theme.text} />
        </Pressable>

        <View style={[styles.inputBox, { borderColor: theme.inputBorder }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.inputPlaceholder}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            style={[styles.input, { color: theme.text }]}
          />
        </View>
      </View>

      {!!errorText && <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errorText}</ThemedText>}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  countryBox: {
    minHeight: 46,
    minWidth: 104,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  countryText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
  },
  inputBox: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  input: {
    fontFamily: Fonts.sans,
    minHeight: 46,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 400,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
});
