import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

const OTP_LENGTH = 5;

export default function OtpVerificationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ recipient?: string | string[]; registrationId?: string | string[] }>();
  const theme = useTheme();
  const { clearError, error, isSubmitting, verifyRegistrationOtp } = useCredentialsAuth();
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  const [digits, setDigits] = React.useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const filledCount = digits.join('').length;
  const registrationId = getSingleParamValue(params.registrationId);
  const isVerifyEnabled = filledCount === OTP_LENGTH && registrationId.length > 0 && !isSubmitting;

  const updateDigits = (next: string[]) => {
    setDigits(next);
  };

  const handleChange = (index: number, rawValue: string) => {
    const cleaned = rawValue.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (cleaned.length === 0) {
      nextDigits[index] = '';
      updateDigits(nextDigits);
      return;
    }

    if (cleaned.length === 1) {
      nextDigits[index] = cleaned;
      updateDigits(nextDigits);
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    let cursor = index;
    for (const char of cleaned) {
      if (cursor > OTP_LENGTH - 1) break;
      nextDigits[cursor] = char;
      cursor += 1;
    }
    updateDigits(nextDigits);

    if (cursor <= OTP_LENGTH - 1) {
      inputRefs.current[cursor]?.focus();
    } else {
      inputRefs.current[OTP_LENGTH - 1]?.blur();
    }
  };

  const handleBackspace = (index: number) => {
    if (digits[index] !== '') return;
    if (index === 0) return;

    const prevIndex = index - 1;
    const nextDigits = [...digits];
    nextDigits[prevIndex] = '';
    updateDigits(nextDigits);
    inputRefs.current[prevIndex]?.focus();
  };

  const handleVerify = React.useCallback(async () => {
    if (!registrationId || filledCount !== OTP_LENGTH) {
      return;
    }

    const isVerified = await verifyRegistrationOtp({
      registrationId,
      otp: digits.join(''),
    });

    if (isVerified) {
      router.replace('/auth/username');
    }
  }, [digits, filledCount, registrationId, router, verifyRegistrationOtp]);

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/auth/register');
  }, [router]);

  const recipient = getSingleParamValue(params.recipient);
  const recipientLabel = recipient ? formatOtpRecipient(recipient) : t('auth.otpMaskedEmail');

  return (
    <AuthScreenLayout
      title={t('auth.otpTitle')}
      subtitle={t('auth.otpSubtitle')}
      onPressBack={handleBack}>
      {error?.provider === 'credentials' ? (
        <View style={styles.screenErrorWrap}>
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error.message}</ThemedText>
        </View>
      ) : null}

      <View style={styles.otpSection}>
        <ThemedText style={styles.otpPrompt}>
          {t('auth.otpPromptPrefix')}{' '}
          <ThemedText style={styles.otpEmail}>{recipientLabel}</ThemedText>
        </ThemedText>

        <View style={styles.otpRow}>
          {digits.map((digit, index) => {
            const isFocused = focusedIndex === index;

            return (
              <TextInput
                key={`otp-${index}`}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onFocus={() => {
                  clearError();
                  setFocusedIndex(index);
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    handleBackspace(index);
                  }
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                returnKeyType="done"
                style={[
                  styles.otpInput,
                  {
                    borderColor: isFocused ? theme.secondary : theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.timerRow}>
          <ThemedText style={styles.timerText}>{t('auth.otpTimer')}</ThemedText>
          <Pressable onPress={() => {}} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText style={[styles.resendText, { color: theme.secondary }]}> {t('auth.otpResend')}</ThemedText>
          </Pressable>
        </View>
      </View>

      <AppButton
        label={t('auth.verifyCode')}
        disabled={!isVerifyEnabled}
        onPress={() => {
          void handleVerify();
        }}
        rightAccessory={isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        style={[
          styles.verifyButton,
          !isVerifyEnabled && styles.verifyButtonDisabled,
          isVerifyEnabled && styles.verifyButtonEnabled,
          isVerifyEnabled
            ? { backgroundColor: theme.secondary, borderColor: theme.secondary }
            : { backgroundColor: theme.disabledBackground, borderColor: theme.disabledBackground },
        ]}
        labelStyle={!isVerifyEnabled ? [styles.verifyLabelDisabled, { color: theme.disabledText }] : undefined}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenErrorWrap: {
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
  },
  otpSection: {
    marginTop: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
  otpPrompt: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  otpEmail: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
    paddingVertical: 0,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  resendText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  verifyButton: {
    marginTop: 32,
  },
  verifyButtonEnabled: {},
  verifyButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  verifyLabelDisabled: {},
  pressed: {
    opacity: 0.75,
  },
});

function getSingleParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function formatOtpRecipient(value: string) {
  return value.includes('@') ? maskEmail(value) : maskPhone(value);
}

function maskEmail(email: string) {
  const [localPart = '', domain = ''] = email.trim().split('@');

  if (!localPart || !domain) {
    return email;
  }

  const visibleCount = Math.min(4, Math.max(1, localPart.length));
  const maskedCount = Math.max(0, localPart.length - visibleCount);
  return `${localPart.slice(0, visibleCount)}${'*'.repeat(maskedCount)}@${domain}`;
}

function maskPhone(phone: string) {
  const trimmed = phone.trim();

  if (trimmed.length <= 4) {
    return trimmed;
  }

  const visibleSuffix = trimmed.slice(-4);
  const prefix = trimmed.startsWith('+') ? '+' : '';
  const hiddenCount = Math.max(0, trimmed.replace(/^\+/, '').length - 4);
  return `${prefix}${'*'.repeat(hiddenCount)}${visibleSuffix}`;
}
