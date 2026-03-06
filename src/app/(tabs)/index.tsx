import * as Device from 'expo-device';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { t } = useTranslation();

  const getDevMenuHint = () => {
    if (Platform.OS === 'web') {
      return <ThemedText type="small">{t('starterHome.hintBrowser')}</ThemedText>;
    }
    if (Device.isDevice) {
      return <ThemedText type="small">{t('starterHome.hintShake')}</ThemedText>;
    }
    const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
    return <ThemedText type="small">{t('starterHome.hintPress', { shortcut })}</ThemedText>;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            {t('starterHome.title')}
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          {t('starterHome.getStarted')}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title={t('starterHome.tryEditing')}
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title={t('starterHome.devTools')} hint={getDevMenuHint()} />
          <HintRow
            title={t('starterHome.freshStart')}
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
