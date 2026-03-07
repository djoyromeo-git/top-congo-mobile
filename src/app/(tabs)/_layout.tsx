import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <>
      <StatusBar
        style={scheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.background}
      />
      <AppTabs />
    </>
  );
}
