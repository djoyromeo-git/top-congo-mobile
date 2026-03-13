import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthIdentifierTabs, type AuthIdentifierMode } from '@/components/ui/auth-identifier-tabs';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { PhoneNumberInput } from '@/components/ui/phone-number-input';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { SocialAuthActions } from '@/features/auth/presentation/social-auth-actions';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { clearError, error, isSubmitting, signInWithCredentials } = useCredentialsAuth();
  const scrollRef = React.useRef<{ scrollTo: (options: { y?: number; animated?: boolean }) => void } | null>(null);

  const [identifierMode, setIdentifierMode] = useState<AuthIdentifierMode>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const normalizedEmail = email.trim();
  const normalizedPhone = phone.trim();
  const normalizedPassword = password.trim();
  const isIdentifierValid = identifierMode === 'email' ? normalizedEmail.length > 0 : normalizedPhone.length > 0;
  const isPasswordValid = normalizedPassword.length > 0;
  const canSubmit = isIdentifierValid && isPasswordValid;

  const shouldShowIdentifierError = submitted && !isIdentifierValid;
  const shouldShowPasswordError = submitted && !isPasswordValid;

  const onSubmitLogin = async () => {
    setSubmitted(true);

    if (!canSubmit) {
      return;
    }

    const isSignedIn = await signInWithCredentials({
      email: identifierMode === 'email' ? normalizedEmail : '',
      phone: identifierMode === 'phone' ? normalizedPhone : '',
      password: normalizedPassword,
    });

    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  };

  React.useEffect(() => {
    if (error?.provider !== 'credentials') {
      return;
    }

    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [error]);

  return (
    <AuthScreenLayout
      title={t('auth.signInCta')}
      subtitle={t('auth.noAccount')}
      actionLabel={t('auth.createAccount')}
      onPressAction={() => router.push('/auth/register')}
      onPressBack={() => router.back()}
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
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            leftAccessory={<Feather name="mail" size={17} color={theme.inputPlaceholder} />}
            errorText={shouldShowIdentifierError ? t('auth.errorEmailRequired') : undefined}
          />
        ) : (
          <PhoneNumberInput
            label={t('auth.phoneNumber')}
            placeholder={t('auth.phonePlaceholder')}
            value={phone}
            onChangeText={(value) => {
              clearError();
              setPhone(value);
            }}
            errorText={shouldShowIdentifierError ? t('auth.errorPhoneRequired') : undefined}
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
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmitLogin}
          leftAccessory={<Feather name="lock" size={17} color={theme.inputPlaceholder} />}
          errorText={shouldShowPasswordError ? t('auth.errorPasswordRequired') : undefined}
        />
      </View>

      <View style={styles.actionsSection}>
        <Pressable
          onPress={() => router.push('/auth/forgot-password')}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText style={[styles.forgotText, { color: theme.secondary }]}>
            {t('auth.forgotPassword')}
          </ThemedText>
        </Pressable>

        <AppButton
          label={t('auth.signInCta')}
          onPress={() => {
            void onSubmitLogin();
          }}
          disabled={!canSubmit || isSubmitting}
          rightAccessory={isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        />

        <View style={styles.dividerWrap}>
          <OrDivider />
        </View>

        <SocialAuthActions />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 16,
  },
  actionsSection: {
    marginTop: 16,
    gap: 18,
  },
  screenErrorWrap: {
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
  },
  forgotText: {
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
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
  pressed: {
    opacity: 0.8,
  },
});
