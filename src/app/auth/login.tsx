import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthScreenLayout } from '@/components/ui/auth-screen-layout';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialAuthButton } from '@/components/ui/social-auth-button';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftAccessory={<Feather name="mail" size={17} color={Palette.neutral['700']} />}
        />

        <FormInput
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showPasswordToggle
          leftAccessory={<Feather name="lock" size={17} color={Palette.neutral['700']} />}
        />
      </View>

      <View style={styles.actionsSection}>
        <Pressable
          onPress={() => router.push('/auth/forgot-password')}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText style={[styles.forgotText, { color: theme.primary }]}>
            {t('auth.forgotPassword')}
          </ThemedText>
        </Pressable>

        <AppButton label={t('auth.signInCta')} onPress={() => router.replace('/(tabs)')} />

        <View style={styles.dividerWrap}>
          <OrDivider />
        </View>

        <View style={styles.socialButtons}>
          <SocialAuthButton provider="apple" />
          <SocialAuthButton provider="google" />
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
  socialButtons: {
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
