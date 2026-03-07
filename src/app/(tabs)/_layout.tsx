import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const normalizedScheme = scheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[normalizedScheme];

  return (
    <>
      <StatusBar
        style={normalizedScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.background}
        translucent={false}
      />
      <AppTabs />
    </>
  );
}
