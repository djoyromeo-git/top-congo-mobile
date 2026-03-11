import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TopBarAction = {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  accessibilityLabel?: string;
};

type AppTopBarProps = {
  leftAction?: TopBarAction;
  rightAction?: TopBarAction;
  centerContent?: React.ReactNode;
  reserveRightSlot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppTopBar({
  leftAction,
  rightAction,
  centerContent,
  reserveRightSlot = true,
  style,
}: AppTopBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.secondary, paddingTop: insets.top + Spacing.two }, style]}>
      <ActionButton action={leftAction} />
      <View style={styles.centerContainer}>
        {centerContent ?? (
          <Image
            source={require('@/assets/expo.icon/Assets/logo-all-white.png')}
            style={styles.defaultLogo}
            contentFit="contain"
          />
        )}
      </View>
      {reserveRightSlot || rightAction ? <ActionButton action={rightAction} /> : null}
    </View>
  );
}

function ActionButton({ action }: { action?: TopBarAction }) {
  const theme = useTheme();

  if (!action) {
    return <View style={styles.placeholder} />;
  }

  return (
    <Pressable
      onPress={action.onPress}
      accessibilityLabel={action.accessibilityLabel}
      style={({ pressed }) => [
        styles.actionButton,
        { borderColor: theme.topBarActionBorder },
        pressed && styles.pressed,
      ]}>
      <Feather name={action.icon} size={21} color={theme.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 74,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  defaultLogo: {
    width: 128,
    height: 30,
  },
  placeholder: {
    width: 48,
    height: 48,
  },
  pressed: {
    opacity: 0.8,
  },
});
