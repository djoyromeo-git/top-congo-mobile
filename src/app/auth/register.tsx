import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthLegal } from '@/components/ui/auth-legal';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { Palette } from '@/constants/theme';
import { SocialAuthActions } from '@/features/auth/presentation/social-auth-actions';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthScreenLayout } from './_layout';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { clearError, error, isSubmitting, registerWithCredentials } = useCredentialsAuth();
  const scrollRef = React.useRef<{ scrollTo: (options: { y?: number; animated?: boolean }) => void } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const registrationGender = 'male' as const;

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const normalizedPhone = phone.trim();
  const normalizedPassword = password.trim();
  const normalizedConfirmPassword = confirmPassword.trim();

  const isNameValid = normalizedName.length > 0;
  const isEmailValid = normalizedEmail.length > 0;
  const isPhoneValid = normalizedPhone.length > 0;
  const isPasswordValid = normalizedPassword.length > 0;
  const isConfirmPasswordValid = normalizedConfirmPassword.length > 0;
  const passwordsMatch = normalizedPassword === normalizedConfirmPassword;
  const canSubmit =
    isNameValid && isEmailValid && isPhoneValid && isPasswordValid && isConfirmPasswordValid && passwordsMatch;

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

    const isRegistered = await registerWithCredentials({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      gender: registrationGender,
      password: normalizedPassword,
      passwordConfirmation: normalizedConfirmPassword,
    });

    if (isRegistered) {
      router.replace('/(tabs)');
    }
  }, [
    canSubmit,
    normalizedConfirmPassword,
    normalizedEmail,
    normalizedName,
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
        <FormInput
          label={t('auth.fullName')}
          placeholder={t('auth.fullNamePlaceholder')}
          value={name}
          onChangeText={(value) => {
            clearError();
            setName(value);
          }}
          autoCapitalize="words"
          textContentType="name"
          leftAccessory={<Feather name="user" size={17} color={Palette.neutral['500']} />}
          errorText={submitted && !isNameValid ? t('auth.errorNameRequired') : undefined}
        />

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
          leftAccessory={<Feather name="mail" size={17} color={Palette.neutral['500']} />}
          errorText={submitted && !isEmailValid ? t('auth.errorEmailRequired') : undefined}
        />

        <FormInput
          label={t('auth.phoneNumber')}
          placeholder={t('auth.phonePlaceholder')}
          value={phone}
          onChangeText={(value) => {
            clearError();
            setPhone(value);
          }}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          leftAccessory={<Feather name="phone" size={17} color={Palette.neutral['500']} />}
          errorText={submitted && !isPhoneValid ? t('auth.errorPhoneRequired') : undefined}
        />

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
          leftAccessory={<Feather name="lock" size={17} color={Palette.neutral['500']} />}
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
          leftAccessory={<Feather name="lock" size={17} color={Palette.neutral['500']} />}
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

        <SocialAuthActions appleButtonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP} />

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
