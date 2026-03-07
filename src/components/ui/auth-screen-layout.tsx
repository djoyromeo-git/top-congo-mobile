import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';

import { AuthHeader } from './auth-header';
import { BackCircleButton } from './back-circle-button';

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  onPressAction?: () => void;
  onPressBack?: () => void;
  headerAlign?: 'left' | 'center';
  statusBarStyle?: StatusBarStyle;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
};

export function AuthScreenLayout({
  title,
  subtitle,
  actionLabel,
  onPressAction,
  onPressBack,
  headerAlign = 'left',
  statusBarStyle = 'dark',
  children,
  contentContainerStyle,
  bodyStyle,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style={statusBarStyle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + Spacing.three,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        <BackCircleButton onPress={onPressBack} style={styles.backButton} />

        <AuthHeader
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          onPressAction={onPressAction}
          align={headerAlign}
        />

        <View style={[styles.body, bodyStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.neutral['100'],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
  },
  backButton: {
    marginBottom: 20,
  },
  body: {
    marginTop: 24,
    gap: 16,
  },
});
