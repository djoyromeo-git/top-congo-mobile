import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
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
            <ThemedText style={styles.liveText}>Live</ThemedText>
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
        </View>

        <Pressable onPress={onPressPlay} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
          <Feather name="play" size={20} color={Palette.neutral['100']} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 116,
    backgroundColor: Palette.red['800'],
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
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
    gap: Spacing.three,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    backgroundColor: '#1D4E89',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    marginBottom: Spacing.one,
  },
  liveText: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
  },
  title: {
    color: Palette.neutral['100'],
    fontSize: 32 / 1.6,
    lineHeight: 39 / 1.6,
    fontWeight: 600,
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
    backgroundColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});

