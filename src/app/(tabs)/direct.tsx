import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { TabShell } from '@/components/ui/tab-shell';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DIRECT_HERO_SOURCE = require('@/assets/images/home/emission.png');

type DirectMode = 'video' | 'audio';

export default function DirectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [mode, setMode] = React.useState<DirectMode>('video');
  const [saved, setSaved] = React.useState(false);

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }, [router]);

  return (
    <TabShell>
      {({ liveCardBottom }) => (
        <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
          <StatusBar style="light" backgroundColor={Palette.red['800']} />

          <View style={styles.topSection}>
            <AppTopBar
              leftAction={{ icon: 'arrow-left', onPress: handleBack, accessibilityLabel: t('direct.back') }}
              rightAction={{ icon: 'search', onPress: () => router.push('/search'), accessibilityLabel: t('direct.search') }}
              style={styles.topBar}
              centerContent={
                <ThemedText style={styles.headerTitle}>{t('direct.title')}</ThemedText>
              }
            />

            <View style={styles.modeSwitch}>
              <DirectModeButton
                label={t('direct.videoMode')}
                active={mode === 'video'}
                onPress={() => setMode('video')}
              />
              <DirectModeButton
                label={t('direct.audioMode')}
                active={mode === 'audio'}
                onPress={() => setMode('audio')}
              />
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroMediaWrap}>
              <Image
                source={DIRECT_HERO_SOURCE}
                style={styles.heroBackdropImage}
                contentFit="contain"
                transition={0}
              />
              <Image
                source={DIRECT_HERO_SOURCE}
                style={styles.heroImage}
                contentFit="contain"
                contentPosition="center"
                transition={0}
              />
              <View style={styles.heroGradient} />

              <View style={styles.heroTopRow}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveBadgeText}>{t('direct.badge')}</ThemedText>
                </View>

                <Pressable
                  hitSlop={8}
                  onPress={() => setSaved((current) => !current)}
                  style={({ pressed }) => [styles.bookmarkButton, pressed && styles.pressed]}>
                  {saved ? (
                    <FontAwesome5 name="bookmark" size={18} color={Palette.neutral['100']} solid />
                  ) : (
                    <Feather name="bookmark" size={20} color={Palette.neutral['100']} />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.heroBody}>
              <ThemedText style={[styles.heroTitle, { color: theme.homeTitle }]}>
                {t('direct.heroTitle')}
              </ThemedText>
            </View>
          </View>

          <View style={{ flex: 1 }} />
          <View style={{ height: liveCardBottom }} />
        </View>
      )}
    </TabShell>
  );
}

function DirectModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.modeButtonText, active ? styles.modeButtonTextActive : styles.modeButtonTextInactive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topSection: {
    backgroundColor: Palette.red['800'],
    paddingBottom: 14,
  },
  topBar: {
    backgroundColor: Palette.red['800'],
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  modeSwitch: {
    marginHorizontal: Spacing.three,
    marginTop: 10,
    borderRadius: 7,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Palette.red['700'],
  },
  modeButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modeButtonActive: {
    backgroundColor: Palette.neutral['100'],
  },
  modeButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  modeButtonTextActive: {
    color: Palette.red['800'],
  },
  modeButtonTextInactive: {
    color: Palette.neutral['100'],
  },
  heroCard: {
    backgroundColor: Palette.neutral['100'],
  },
  heroMediaWrap: {
    height: 208,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Palette.blue['800'],
  },
  heroBackdropImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 33, 95, 0.18)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: Palette.red['800'],
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Palette.neutral['100'],
  },
  liveBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
  },
  bookmarkButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.82,
  },
});
