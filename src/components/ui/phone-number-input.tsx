import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StatusBar, StyleSheet, TextInput, View } from 'react-native';
import CountryPicker, {
  Flag,
  getCallingCode,
  type Country,
  type CountryCode,
} from 'react-native-country-picker-modal';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { CaretDown } from 'phosphor-react-native';

export const DEFAULT_PHONE_COUNTRY_CODE: CountryCode = 'CD';
export const DEFAULT_PHONE_CALLING_CODE = '+243';

type PhoneNumberInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  errorText?: string;
  countryCode?: CountryCode;
  onChangeCountry?: (country: Country) => void;
};

export function PhoneNumberInput({
  label,
  value,
  onChangeText,
  placeholder,
  errorText,
  countryCode = DEFAULT_PHONE_COUNTRY_CODE,
  onChangeCountry,
}: PhoneNumberInputProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [callingCode, setCallingCode] = React.useState(DEFAULT_PHONE_CALLING_CODE);
  const androidModalTopOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0;

  React.useEffect(() => {
    let isMounted = true;

    void getCallingCode(countryCode)
      .then((nextCallingCode) => {
        if (isMounted) {
          setCallingCode(`+${nextCallingCode}`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCallingCode(DEFAULT_PHONE_CALLING_CODE);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <View style={styles.row}>
        <CountryPicker
          countryCode={countryCode}
          onSelect={onChangeCountry ?? (() => {})}
          preferredCountries={['CD', 'CG', 'BE', 'FR', 'CA', 'US']}
          translation={i18n.language.startsWith('fr') ? 'fra' : 'common'}
          withFilter
          withEmoji={Platform.OS !== 'web'}
          withFlag
          withFlagButton
          withCountryNameButton={false}
          withCallingCode={false}
          withCloseButton
          modalProps={Platform.OS === 'web' ? { ariaHideApp: false } : undefined}
          closeButtonStyle={androidModalTopOffset ? { marginTop: androidModalTopOffset } : undefined}
          filterProps={androidModalTopOffset ? { style: { marginTop: androidModalTopOffset } } : undefined}
          renderFlagButton={({ onOpen }) => (
            <Pressable
              style={[styles.countryBox, { borderColor: theme.inputBorder }]}
              onPress={onOpen}>
              <View style={styles.countryInner}>
                {Platform.OS === 'web' ? (
                  <Flag countryCode={countryCode} flagSize={18} withEmoji={false} withFlagButton />
                ) : (
                  <ThemedText style={styles.flag}>{countryCodeToEmoji(countryCode)}</ThemedText>
                )}
                <CaretDown size={18} weight="bold" color={theme.text} />
              </View>
            </Pressable>
          )}
        />

        <View style={[styles.inputBox, { borderColor: theme.inputBorder }]}>
          <ThemedText style={styles.countryCode}>{callingCode}</ThemedText>
          <TextInput
            value={value}
            onChangeText={(nextValue) => {
              onChangeText(formatPhoneInput(nextValue));
            }}
            placeholder={placeholder}
            placeholderTextColor={theme.inputPlaceholder}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            style={[styles.input, { color: theme.text }]}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  countryBox: {
    minHeight: 46,
    width: 84,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 12,
    flexShrink: 0,
    backgroundColor: 'transparent',
  },
  countryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  flag: {
    fontSize: 20,
    lineHeight: 22,
  },
  inputBox: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  countryCode: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: 700,
    minWidth: 38,
    marginRight: 6,
  },
  input: {
    fontFamily: Fonts.sans,
    minHeight: 46,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: 400,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
});

function countryCodeToEmoji(countryCode: CountryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function formatPhoneInput(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, '').slice(0, 15);
  return digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}
