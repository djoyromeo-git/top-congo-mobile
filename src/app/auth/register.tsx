import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EnvelopeSimple, LockSimple } from 'phosphor-react-native';
import type { Country, CountryCode } from 'react-native-country-picker-modal';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthIdentifierTabs, type AuthIdentifierMode } from '@/components/ui/auth-identifier-tabs';
import { AuthLegal } from '@/components/ui/auth-legal';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import {
  DEFAULT_PHONE_CALLING_CODE,
  DEFAULT_PHONE_COUNTRY_CODE,
  PhoneNumberInput,
} from '@/components/ui/phone-number-input';
import { Palette } from '@/constants/theme';
import { SocialAuthActions } from '@/features/auth/presentation/social-auth-actions';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { clearError, error, isSubmitting, registerWithCredentials } = useCredentialsAuth();
  const scrollRef = React.useRef<{ scrollTo: (options: { y?: number; animated?: boolean }) => void } | null>(null);

  const [identifierMode, setIdentifierMode] = useState<AuthIdentifierMode>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY_CODE);
  const [phoneCallingCode, setPhoneCallingCode] = useState(DEFAULT_PHONE_CALLING_CODE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const registrationGender = 'male' as const;

  const normalizedEmail = email.trim();
  const normalizedPhone = buildInternationalPhoneNumber(phoneCallingCode, phone);
  const normalizedPassword = password.trim();
  const normalizedConfirmPassword = confirmPassword.trim();
  const derivedName = identifierMode === 'email' ? normalizedEmail : normalizedPhone;

  const isIdentifierValid = identifierMode === 'email' ? normalizedEmail.length > 0 : normalizedPhone.length > 0;
  const isPasswordValid = normalizedPassword.length > 0;
  const isConfirmPasswordValid = normalizedConfirmPassword.length > 0;
  const passwordsMatch = normalizedPassword === normalizedConfirmPassword;
  const canSubmit = isIdentifierValid && isPasswordValid && isConfirmPasswordValid && passwordsMatch;

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/onboarding');
  }, [router]);

  const onSubmit = React.useCallback(async () => {
    setSubmitted(true);

    if (!canSubmit) {
      return;
    }

    const result = await registerWithCredentials({
      name: derivedName,
      email: identifierMode === 'email' ? normalizedEmail : '',
      phone: identifierMode === 'phone' ? normalizedPhone : '',
      gender: registrationGender,
      password: normalizedPassword,
      passwordConfirmation: normalizedConfirmPassword,
    });

    const recipient = identifierMode === 'email' ? normalizedEmail : normalizedPhone;

    if (result?.kind === 'session') {
      router.replace('/auth/username');
      return;
    }

    if (result?.kind === 'otp_pending') {
      router.replace({
        pathname: '/auth/otp',
        params: {
          ...(recipient ? { recipient } : {}),
          registrationId: result.registrationId,
        },
      });
    }
  }, [
    canSubmit,
    derivedName,
    identifierMode,
    normalizedConfirmPassword,
    normalizedEmail,
    normalizedPhone,
    normalizedPassword,
    registerWithCredentials,
    registrationGender,
    router,
  ]);

  React.useEffect(() => {
    if (error?.provider !== 'credentials') {
      return;
    }

    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [error]);

  const onChangePhoneCountry = React.useCallback((country: Country) => {
    clearError();
    setPhoneCountryCode(country.cca2);
    setPhoneCallingCode(getCountryCallingCode(country));
  }, [clearError]);

  return (
    <AuthScreenLayout
      title={t('auth.createAccount')}
      subtitle={t('auth.alreadyHaveAccount')}
      actionLabel={t('auth.signIn')}
      onPressAction={() => router.push('/auth/login')}
      onPressBack={handleBack}
      scrollRef={scrollRef}>
      {error?.provider === 'credentials' ? (
        <View style={styles.screenErrorWrap}>
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error.message}</ThemedText>
        </View>
      ) : null}

      <View style={styles.formSection}>
        <AuthIdentifierTabs
          value={identifierMode}
          onChange={(value) => {
            clearError();
            setIdentifierMode(value);
          }}
          emailLabel={t('auth.emailAddress')}
          phoneLabel={t('auth.phoneNumber')}
        />

        {identifierMode === 'email' ? (
        <FormInput
          label={t('auth.emailAddress')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={(value) => {
            clearError();
            setEmail(value);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          leftAccessory={<EnvelopeSimple size={18} weight="bold" color={Palette.neutral['500']} />}
          errorText={submitted && !isIdentifierValid ? t('auth.errorEmailRequired') : undefined}
        />
        ) : (
          <PhoneNumberInput
            label={t('auth.phoneNumber')}
            placeholder="812 345 678"
            value={phone}
            countryCode={phoneCountryCode}
            onChangeCountry={onChangePhoneCountry}
            onChangeText={(value) => {
              clearError();
              setPhone(value);
            }}
            errorText={submitted && !isIdentifierValid ? t('auth.errorPhoneRequired') : undefined}
          />
        )}

        <FormInput
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={(value) => {
            clearError();
            setPassword(value);
          }}
          secureTextEntry
          showPasswordToggle
          autoComplete="password-new"
          leftAccessory={<LockSimple size={18} weight="bold" color={Palette.neutral['500']} />}
          errorText={submitted && !isPasswordValid ? t('auth.errorPasswordRequired') : undefined}
        />

        <FormInput
          label={t('auth.confirmPassword')}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={(value) => {
            clearError();
            setConfirmPassword(value);
          }}
          secureTextEntry
          showPasswordToggle
          autoComplete="password-new"
          leftAccessory={<LockSimple size={18} weight="bold" color={Palette.neutral['500']} />}
          errorText={
            submitted && !isConfirmPasswordValid
              ? t('auth.errorConfirmPasswordRequired')
              : submitted && !passwordsMatch
                ? t('auth.errorPasswordMismatch')
                : undefined
          }
        />
      </View>

      <View style={styles.actionsSection}>
        <AppButton
          label={t('auth.createAccountCta')}
          onPress={() => {
            void onSubmit();
          }}
          disabled={!canSubmit || isSubmitting}
          rightAccessory={isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        />

        <View style={styles.dividerWrap}>
          <OrDivider />
        </View>

        <SocialAuthActions />

        <View style={styles.legalWrap}>
          <AuthLegal />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 16,
  },
  actionsSection: {
    marginTop: 30,
    gap: 18,
  },
  screenErrorWrap: {
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
  },
  dividerWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
  legalWrap: {
    marginTop: 8,
  },
});

function getCountryCallingCode(country: Country) {
  const nextCallingCode = country.callingCode[0];
  return nextCallingCode ? `+${nextCallingCode}` : DEFAULT_PHONE_CALLING_CODE;
}

function buildInternationalPhoneNumber(callingCode: string, phone: string) {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  return digitsOnly ? `${callingCode}${digitsOnly}` : '';
}
