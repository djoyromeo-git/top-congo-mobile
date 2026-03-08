import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabShellRenderProps = {
  liveCardBottom: number;
};

type TabShellProps = {
  children?: React.ReactNode | ((props: TabShellRenderProps) => React.ReactNode);
};

export function TabShell({ children }: TabShellProps) {
  const insets = useSafeAreaInsets();
  const liveCardBottom = insets.bottom + 76;
  const content = typeof children === 'function' ? children({ liveCardBottom }) : children;

  return (
    <View style={styles.content}>{content}</View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
