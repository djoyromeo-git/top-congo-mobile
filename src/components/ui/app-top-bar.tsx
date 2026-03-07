import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TopBarAction = {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  accessibilityLabel?: string;
};

type AppTopBarProps = {
  leftAction?: TopBarAction;
  rightAction?: TopBarAction;
  logo?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppTopBar({ leftAction, rightAction, logo, style }: AppTopBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.primary, paddingTop: insets.top + Spacing.two }, style]}>
      <ActionButton action={leftAction} />
      <View style={styles.logoContainer}>
        {logo ?? (
          <Image
            source={require('@/assets/expo.icon/Assets/logo-all-white.png')}
            style={styles.defaultLogo}
            contentFit="contain"
          />
        )}
      </View>
      <ActionButton action={rightAction} />
    </View>
  );
}

function ActionButton({ action }: { action?: TopBarAction }) {
  if (!action) {
    return <View style={styles.placeholder} />;
  }

  return (
    <Pressable
      onPress={action.onPress}
      accessibilityLabel={action.accessibilityLabel}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <Feather name={action.icon} size={21} color={Palette.neutral['100']} />
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
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
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
