import { Image } from 'expo-image';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  host: string;
  imageSource: number;
  onPress?: () => void;
};

export function EmissionShowCard({ title, host, imageSource, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.media}>
        <Image source={imageSource} style={styles.image} contentFit="cover" transition={0} />
        <LinearGradient
          colors={['rgba(24,31,64,0.08)', 'rgba(23,65,151,0.82)']}
          style={styles.overlay}
        />
      </View>

      <View style={styles.content}>
        <ThemedText numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText numberOfLines={1} style={[styles.host, { color: 'rgba(255,255,255,0.86)' }]}>
          Avec {host}
        </ThemedText>
      </View>

      <View style={[styles.action, { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)' }]}>
        <ArrowRight size={20} weight="bold" color={theme.onPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: Palette.blue['800'],
    minHeight: 190,
    marginBottom: Spacing.three,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
    width: '80%',
  },
  title: {
    color: Palette.neutral['100'],
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  host: {
    color: Palette.neutral['100'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  action: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pressed: {
    opacity: 0.9,
  },
});
