import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AuthHeader } from '@/components/ui/auth-header';
import { AuthLegal } from '@/components/ui/auth-legal';
import { BackCircleButton } from '@/components/ui/back-circle-button';
import { FormInput } from '@/components/ui/form-input';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialAuthButton } from '@/components/ui/social-auth-button';

export default function AuthPreviewScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 14,
            paddingBottom: insets.bottom + 18,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <BackCircleButton onPress={() => {}} style={styles.backButton} />

        <AuthHeader
          title={t('auth.createAccount')}
          subtitle={t('auth.alreadyHaveAccount')}
          actionLabel={t('auth.signIn')}
          onPressAction={() => {}}
        />

        <View style={styles.formSection}>
          <FormInput
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftAccessory={<Feather name="mail" size={29 / 1.3} color="#131722" />}
          />

          <FormInput
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={29 / 1.3} color="#131722" />}
          />

          <FormInput
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={29 / 1.3} color="#131722" />}
          />
        </View>

        <View style={styles.actionsSection}>
          <AppButton
            label={t('auth.createAccountCta')}
            onPress={() => {}}
            style={styles.primaryButton}
            labelStyle={styles.primaryButtonLabel}
          />

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 28,
  },
  formSection: {
    marginTop: 22,
    gap: 18,
  },
  actionsSection: {
    marginTop: 28,
    gap: 20,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 11,
  },
  primaryButtonLabel: {
    fontSize: 20 / 1.2,
    lineHeight: 28 / 1.2,
    fontWeight: 500,
  },
  dividerWrap: {
    marginTop: 4,
    marginBottom: 2,
  },
  socialButtons: {
    gap: 12,
  },
  legalWrap: {
    marginTop: 6,
  },
});
