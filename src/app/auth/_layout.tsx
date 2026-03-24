import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/ui/auth-header';
import { BackCircleButton } from '@/components/ui/back-circle-button';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}

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
  scrollRef?: React.RefObject<any>;
};

export function AuthScreenLayout({
  title,
  subtitle,
  actionLabel,
  onPressAction,
  onPressBack,
  headerAlign = 'left',
  statusBarStyle,
  children,
  contentContainerStyle,
  bodyStyle,
  scrollRef,
}: AuthScreenLayoutProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const topSpacing = Platform.OS === 'web' ? Spacing.three : 0;
  const resolvedStatusBarStyle: StatusBarStyle =
    statusBarStyle ?? (colorScheme === 'dark' ? 'light' : 'dark');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar style={resolvedStatusBarStyle} backgroundColor={theme.background} translucent={false} />

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topSpacing,
            paddingBottom: insets.bottom + Spacing.three,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
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
