import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { Spacing } from '@/constants/theme';

type OnboardingFirstScreenProps = {
  onPressCreateAccount: () => void;
  onPressTryPremium: () => void;
};

export function OnboardingFirstScreen({
  onPressCreateAccount,
  onPressTryPremium,
}: OnboardingFirstScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <View style={styles.topRing} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}>
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
            label={t('onboarding.createAccount')}
            onPress={onPressCreateAccount}
            style={styles.primaryButton}
            labelStyle={styles.primaryButtonLabel}
          />
          <Pressable onPress={onPressTryPremium} style={({ pressed }) => pressed && styles.pressed}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#040618',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom : Spacing.two,
    backgroundColor: '#FFFFFF',
  },
  paginationDot: {
    width: 6,
    height: 6,
    marginBottom : Spacing.two,
    borderRadius: 5,
    backgroundColor: '#BFC7DE',
  },
  title: {
    color: '#F8FAFF',
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
    color: '#ECF0FA',
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
    borderColor: 'rgba(39, 52, 116, 0.38)',
    bottom: -352,
    left: -280,
  },
  primaryButton: {
    backgroundColor: '#2148A6',
    borderColor: '#2148A6',
    borderRadius: 14,
    minHeight: 58,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
  },
  secondaryAction: {
    color: '#F4F7FF',
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
    borderColor: 'rgba(39, 52, 116, 0.42)',
    top: -72,
    right: -72,
  },
  pressed: {
    opacity: 0.75,
  },
});
