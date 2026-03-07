import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [code, setCode] = React.useState('');

  const canVerify = code.trim().length > 0;

  return (
    <AuthScreenLayout
      title={t('auth.forgotPasswordTitle')}
      subtitle={
        <ThemedText style={styles.subtitle}>
          {t('auth.forgotPasswordSubtitlePrefix')}{' '}
          <ThemedText style={styles.subtitleStrong}>{t('auth.otpMaskedEmail')}</ThemedText>
        </ThemedText>
      }
      onPressBack={() => router.back()}>
      <View style={styles.content}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('auth.forgotPasswordCodePlaceholder')}
          placeholderTextColor={theme.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
        />

        <AppButton
          label={t('auth.forgotPasswordVerifyCta')}
          disabled={!canVerify}
          onPress={() => {}}
          style={[
            styles.verifyButton,
            canVerify ? styles.verifyButtonEnabled : styles.verifyButtonDisabled,
            canVerify
              ? { backgroundColor: theme.secondary, borderColor: theme.secondary }
              : { backgroundColor: theme.disabledBackground, borderColor: theme.disabledBackground },
          ]}
          labelStyle={!canVerify ? [styles.verifyLabelDisabled, { color: theme.disabledText }] : undefined}
        />

        <View style={styles.resendRow}>
          <ThemedText style={styles.resendText}>{t('auth.forgotPasswordNoCode')}</ThemedText>
          <Pressable onPress={() => {}} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText style={[styles.resendLink, { color: theme.secondary }]}>
              {t('auth.otpResend')}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 24,
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  subtitleStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 400,
  },
  verifyButton: {
    marginTop: 8,
  },
  verifyButtonEnabled: {},
  verifyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyLabelDisabled: {},
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  resendLink: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.8,
  },
});
