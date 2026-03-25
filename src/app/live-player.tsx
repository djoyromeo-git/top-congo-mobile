import { CaretDown, DotsThreeVertical, Pause, Play, RotateCcw, RotateCw } from 'phosphor-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  isLiveStreamConfigured,
  toggleLiveAudio,
  useLiveAudioStatus,
  useLiveMetadata,
  useLiveProgramInfo,
  useLiveReconnectState,
} from '@/services/live-audio';

export default function LivePlayerScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const reconnectState = useLiveReconnectState();
  const program = useLiveProgramInfo();
  const metadata = useLiveMetadata();

  const handleToggleLive = React.useCallback(() => {
    if (!isLiveStreamConfigured) {
      return;
    }

    void toggleLiveAudio({
      title: program.title,
      artist: program.host,
      albumTitle: program.schedule,
    });
  }, [program.host, program.schedule, program.title]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.secondary }]}>
      <View style={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <Pressable onPress={() => router.back()} style={styles.headerAction}>
            <CaretDown size={24} weight="bold" color={theme.onPrimary} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <ThemedText style={[styles.headerTitle, { color: theme.onPrimary }]}>{t('auth.liveBadge')}</ThemedText>
          </View>
          <Pressable style={styles.headerAction}>
            <DotsThreeVertical size={20} weight="bold" color={theme.onPrimary} />
          </Pressable>
        </View>

        <View style={[styles.coverWrap, { backgroundColor: theme.background }]}>
          <Image
            source={metadata.artworkUrl || require('@/assets/images/icon.png')}
            style={styles.coverImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.infoWrap}>
          <ThemedText style={[styles.programTitle, { color: theme.onPrimary }]}>{program.title}</ThemedText>
          {program.host ? (
            <ThemedText style={[styles.programHost, { color: theme.onPrimary }]}>{program.host}</ThemedText>
          ) : null}
          {program.schedule ? (
            <ThemedText style={[styles.programSchedule, { color: theme.onPrimary }]}>{program.schedule}</ThemedText>
          ) : null}
        </View>

        <View style={styles.sliderWrap}>
          <View style={[styles.sliderTrack, { backgroundColor: Palette.blue['300'] }]} />
          <View style={[styles.sliderFill, { backgroundColor: Palette.blue['100'] }]} />
          <View style={[styles.sliderThumb, { backgroundColor: Palette.blue['100'] }]} />
        </View>

        <View style={styles.controlsRow}>
          <Pressable style={styles.secondaryControl}>
            <RotateCcw size={24} weight="bold" color={theme.onPrimary} />
          </Pressable>

          <Pressable
            disabled={!isLiveStreamConfigured}
            onPress={handleToggleLive}
            style={({ pressed }) => [
              styles.mainPlayButton,
              {
                backgroundColor: isLiveStreamConfigured ? theme.background : theme.disabledBackground,
              },
              pressed && styles.pressed,
            ]}>
            {isBuffering || isStarting ? (
              <ActivityIndicator size="small" color={theme.secondary} />
              ) : isPlaying ? (
                <Pause size={34} weight="fill" color={isLiveStreamConfigured ? theme.secondary : theme.disabledText} />
              ) : (
                <Play
                  size={34}
                  weight="fill"
                  color={isLiveStreamConfigured ? theme.secondary : theme.disabledText}
                  style={styles.playIcon}
                />
              )}
            </Pressable>
          <Pressable style={styles.secondaryControl}>
            <RotateCw size={24} weight="bold" color={theme.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.stateWrap}>
          {reconnectState.isReconnecting ? (
            <View style={styles.reconnectInline}>
              <ActivityIndicator size="small" color={theme.onPrimary} />
              <ThemedText style={[styles.stateText, { color: theme.onPrimary }]}>
                {`Reconnexion... (tentative ${reconnectState.attempt})`}
              </ThemedText>
            </View>
          ) : null}

          <ThemedText style={[styles.stateText, { color: theme.onPrimary }]}>
            {!isLiveStreamConfigured
              ? 'Stream indisponible'
              : reconnectState.isReconnecting
                ? 'Reconnexion en cours'
                : isBuffering || isStarting
                  ? 'Chargement...'
                  : isPlaying
                    ? 'En direct'
                    : 'Pret a lancer'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  infoWrap: {
    alignItems: 'center',
    gap: 6,
  },
  programTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    textAlign: 'center',
  },
  programHost: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
  },
  programSchedule: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  sliderWrap: {
    marginTop: 8,
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  controlsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  secondaryControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayButton: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 4,
  },
  stateWrap: {
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  reconnectInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.86,
  },
});
