import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AuthLegal } from '@/components/ui/auth-legal';
import { AuthScreenLayout } from '@/components/ui/auth-screen-layout';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialAuthButton } from '@/components/ui/social-auth-button';
import { Palette, Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <AuthScreenLayout
      title={t('auth.createAccount')}
      subtitle={t('auth.alreadyHaveAccount')}
      actionLabel={t('auth.signIn')}
      onPressAction={() => {}}
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

        <FormInput
          label={t('auth.confirmPassword')}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          showPasswordToggle
          leftAccessory={<Feather name="lock" size={17} color={Palette.neutral['700']} />}
        />
      </View>

      <View style={styles.actionsSection}>
        <AppButton label={t('auth.createAccountCta')} onPress={() => router.push('/auth/otp')} />

        <View style={styles.dividerWrap}>
          <OrDivider />
        </View>

        <View style={styles.socialButtons}>
          <SocialAuthButton provider="apple" />
          <SocialAuthButton provider="google" />
        </View>

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
  
  dividerWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  socialButtons: {
    gap: 8,
  },
  legalWrap: {
    marginTop: 8,
  },
});
