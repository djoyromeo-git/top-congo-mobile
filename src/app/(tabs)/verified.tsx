import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export default function VerifiedScreen() {
  const theme = useTheme();
  return <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
