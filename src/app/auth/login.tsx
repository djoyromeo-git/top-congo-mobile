import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { SocialAuthActions } from '@/features/auth/presentation/social-auth-actions';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { clearError, error, isSubmitting, signInWithCredentials } = useCredentialsAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();
  const isEmailValid = normalizedEmail.length > 0;
  const isPasswordValid = normalizedPassword.length > 0;
  const canSubmit = isEmailValid && isPasswordValid;

  const shouldShowEmailError = submitted && !isEmailValid;
  const shouldShowPasswordError = submitted && !isPasswordValid;

  const onSubmitLogin = async () => {
    setSubmitted(true);

    if (!canSubmit) {
      return;
    }

    const isSignedIn = await signInWithCredentials({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  };

  return (
    <AuthScreenLayout
      title={t('auth.signInCta')}
      subtitle={t('auth.noAccount')}
      actionLabel={t('auth.createAccount')}
      onPressAction={() => router.push('/auth/register')}
      onPressBack={() => router.back()}>
      <View style={styles.formSection}>
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
          errorText={shouldShowEmailError ? t('auth.errorEmailRequired') : undefined}
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

        {error?.provider === 'credentials' ? (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error.message}</ThemedText>
        ) : null}

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
