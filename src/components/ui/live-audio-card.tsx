import { Entypo } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';

import { ThemedText } from '../themed-text';

type LiveAudioCardProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onPressPlay?: () => void;
};

export function LiveAudioCard({ title, subtitle, onPress, onPressPlay }: LiveAudioCardProps) {
  const { t } = useTranslation();
  const bars = useMemo(() => [8, 16, 24, 14, 20, 10, 18, 12, 22, 14, 8, 18, 24, 16, 12, 20], []);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.waveWrap}>
        {bars.map((height, index) => (
          <View key={index} style={[styles.bar, { height }]} />
        ))}
      </View>

        <View style={styles.content}>
        <View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>{t('auth.liveBadge')}</ThemedText>
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {/* {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>} */}
        </View>

        <Pressable onPress={onPressPlay} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
          <Entypo name="controller-play" size={22} color={Palette.red['800']} style={styles.playIcon} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 80,
    backgroundColor: Palette.red['800'],
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  waveWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: 0.3,
    paddingHorizontal: Spacing.two,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Palette.red['300'],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#1D4E89',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    gap: 3,
    marginBottom: Spacing.half,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.neutral['100'],
  },
  liveText: {
    color: Palette.neutral['100'],
    fontSize: 7,
    lineHeight: 12,
    fontWeight: 700,
  },
  title: {
    color: Palette.neutral['100'],
    fontSize: 15,
    lineHeight: 17,
    fontWeight: 500,
  },
  subtitle: {
    color: Palette.neutral['100'],
    opacity: 0.85,
    fontSize: 15,
    lineHeight: 19,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Palette.neutral['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
