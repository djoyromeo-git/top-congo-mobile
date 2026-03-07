import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TabList, TabListProps, Tabs, TabSlot, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { Palette } from '@/constants/theme';

type IconRenderer = (color: string) => React.ReactNode;

function TabButton({
  isFocused,
  icon,
  activeLabel,
  ...props
}: TabTriggerSlotProps & { icon: IconRenderer; activeLabel?: string }) {
  const activeColor = Palette.blue['800'];
  const inactiveColor = '#CDD3E2';
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
      <View style={styles.item}>
        {icon(iconColor)}
        {isFocused && activeLabel ? (
          <ThemedText style={[styles.activeLabel, { color: activeColor }]}>{activeLabel}</ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps & { bottomInset: number }) {
  const { bottomInset, ...rest } = props;

  return (
    <View
      {...rest}
      style={[
        styles.list,
        {
          paddingBottom: 12 + Math.max(bottomInset, 0),
        },
      ]}>
      {rest.children}
    </View>
  );
}

export default function AppTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot style={styles.slot} />

      <TabList asChild>
        <CustomTabList bottomInset={insets.bottom}>
          <TabTrigger name="index" href="/(tabs)" asChild>
            <TabButton
              activeLabel={t('tabs.headline')}
              icon={(color) => <Ionicons name="home" size={22} color={color} />}
            />
          </TabTrigger>

          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton
              activeLabel={t('tabs.podcast')}
              icon={(color) => <MaterialIcons name="podcasts" size={22} color={color} />}
            />
          </TabTrigger>

          <TabTrigger name="auth-preview" href="/auth-preview" asChild>
            <TabButton
              activeLabel={t('tabs.emissions')}
              icon={(color) => <MaterialIcons name="ondemand-video" size={22} color={color} />}
            />
          </TabTrigger>

          <TabTrigger name="verified" href="/verified" asChild>
            <TabButton
              activeLabel={t('tabs.premium')}
              icon={(color) => <MaterialIcons name="verified" size={22} color={color} />}
            />
          </TabTrigger>

          <TabTrigger name="video" href="/video" asChild>
            <TabButton
              activeLabel={t('tabs.direct')}
              icon={(color) => <MaterialIcons name="videocam" size={22} color={color} />}
            />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  list: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 16,
  },
  trigger: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: 500,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.72,
  },
});
