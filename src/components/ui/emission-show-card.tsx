import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ContentImage } from '@/components/ui/content-image';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  host: string;
  imageSource: string | number;
  onPress?: () => void;
};

export function EmissionShowCard({ title, host, imageSource, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.media}>
        <ContentImage source={imageSource} style={styles.image} />
        <LinearGradient
          colors={['rgba(24,31,64,0.0)', 'rgba(23,65,151,0.86)']}
          locations={[0, 1]}
          style={styles.overlay}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']}
          locations={[0, 0.6, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomFade}
        />
      </View>

      <View style={styles.content}>
        <ThemedText numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.host}>
          Avec {host}
        </ThemedText>
      </View>

      <View style={styles.action}>
        <ArrowRight size={20} weight="bold" color={theme.onPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: Palette.blue['800'],
    minHeight: 197,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
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
  bottomFade: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 70,
    bottom: 18,
  },
  title: {
    color: Palette.neutral['100'],
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },
  host: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '400',
  },
  action: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pressed: {
    opacity: 0.9,
  },
});
