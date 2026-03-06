import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type OrDividerProps = {
  label?: string;
};

export function OrDivider({ label }: OrDividerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.text }]} />
      <ThemedText style={styles.label}>{label ?? t('common.or')}</ThemedText>
      <View style={[styles.line, { backgroundColor: theme.text }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  line: {
    flex: 1,
    height: 1.5,
    opacity: 0.9,
  },
  label: {
    fontSize: 22 / 1.2,
    lineHeight: 28 / 1.2,
    fontWeight: 700,
    textTransform: 'lowercase',
  },
});
