import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type AuthLegalProps = {
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
};

export function AuthLegal({ onPressTerms, onPressPrivacy }: AuthLegalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>{t('auth.legalPrefix')}</ThemedText>
      <Pressable onPress={onPressTerms} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText style={[styles.link, { color: theme.primary }]}>{t('auth.terms')}</ThemedText>
      </Pressable>
      <ThemedText style={styles.text}>{t('auth.legalMiddle')}</ThemedText>
      <Pressable onPress={onPressPrivacy} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText style={[styles.link, { color: theme.primary }]}>{t('auth.privacy')}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: Spacing.half,
  },
  text: {
    fontSize: 17 / 1.2,
    lineHeight: 25 / 1.2,
    fontWeight: 500,
    textAlign: 'center',
  },
  link: {
    fontSize: 17 / 1.2,
    lineHeight: 25 / 1.2,
    fontWeight: 700,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.75,
  },
});
