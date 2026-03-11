import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { Palette, Spacing } from '@/constants/theme';

type OnboardingScreenProps = {
  onPressCreateAccount?: () => void;
  onPressContinueWithoutAccount?: () => void;
  onPressTryPremium?: () => void;
};

export default function OnboardingScreen({
  onPressCreateAccount,
  onPressContinueWithoutAccount,
  onPressTryPremium,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const handleCreateAccount = onPressCreateAccount ?? (() => router.replace('/auth/register'));
  const handleContinueWithoutAccount =
    onPressContinueWithoutAccount ?? (() => router.replace('/(tabs)'));
  const handleTryPremium = onPressTryPremium ?? (() => router.replace('/premium'));

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={Palette.blueShade['700']} />
      <View style={styles.topRing} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Image
              source={require('@/assets/expo.icon/Assets/logo-all-white.png')}
              style={styles.logo}
              contentFit="contain"
            />

            <View style={styles.pagination}>
              <View style={styles.paginationActive} />
              <View style={styles.paginationDot} />
              <View style={styles.paginationDot} />
            </View>

            <ThemedText style={styles.title}>{t('onboarding.firstTitle')}</ThemedText>
            <ThemedText style={styles.subtitle}>{t('onboarding.firstSubtitle')}</ThemedText>
          </View>

          <View style={styles.actions}>
            <View pointerEvents="none" style={styles.buttonArcMask}>
              <View style={styles.buttonArc} />
            </View>

            <AppButton
              testID="onboarding-create-account"
              label={t('onboarding.createAccount')}
              size="lg"
              onPress={handleCreateAccount}
            />
            <AppButton
              testID="onboarding-continue-without-account"
              label={t('onboarding.continueWithoutAccount')}
              variant="ghost"
              size="lg"
              onPress={handleContinueWithoutAccount}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            />
            <Pressable
              testID="onboarding-try-premium"
              onPress={handleTryPremium}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText
                style={styles.secondaryAction}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                {t('onboarding.tryPremium')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.blueShade['700'],
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
  },
  heroSection: {
    marginTop: 96,
    alignItems: 'center',
    gap: Spacing.one,
  },
  logo: {
    width: 164,
    height: 80,
    marginBottom: Spacing.five,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  paginationActive: {
    width: 60,
    height: 6,
    borderRadius: 999,
    marginBottom: Spacing.two,
    backgroundColor: Palette.neutral['100'],
  },
  paginationDot: {
    width: 6,
    height: 6,
    marginBottom: Spacing.two,
    borderRadius: 5,
    backgroundColor: Palette.blue['300'],
  },
  title: {
    color: Palette.neutral['100'],
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
    letterSpacing: -0.4,
    marginTop: Spacing.one,
    maxWidth: 342,
  },
  subtitle: {
    marginTop: Spacing.one,
    color: Palette.blue['200'],
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 500,
    maxWidth: 338,
  },
  actions: {
    position: 'relative',
    gap: 16,
    paddingBottom: Spacing.one,
  },
  buttonArcMask: {
    position: 'absolute',
    top: -200,
    left: -20,
    right: -20,
    height: 200,
    overflow: 'hidden',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  buttonArc: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 50,
    borderColor: Palette.blueShade['300'],
    opacity: 0.38,
    bottom: -352,
    left: -280,
  },
  secondaryButton: {
    borderColor: Palette.neutral['100'],
    backgroundColor: 'transparent',
  },
  secondaryButtonLabel: {
    color: Palette.neutral['100'],
  },
  secondaryAction: {
    color: Palette.neutral['100'],
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 500,
  },
  topRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 32,
    borderColor: Palette.blueShade['300'],
    opacity: 0.42,
    top: -72,
    right: -72,
  },
  pressed: {
    opacity: 0.75,
  },
});
