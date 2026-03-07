import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';

type HeadlineCardProps = {
  badge: string;
  date: string;
  title: string;
  imageSource?: number;
  fallbackColor?: string;
  onPress?: () => void;
};

export function HeadlineCard({
  badge,
  date,
  title,
  imageSource,
  fallbackColor = '#2B2F39',
  onPress,
}: HeadlineCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.media, { backgroundColor: fallbackColor }]}>
        {imageSource ? <Image source={imageSource} style={styles.mediaImage} contentFit="cover" /> : null}
        <View style={styles.mediaOverlay} />
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>• {badge}</ThemedText>
        </View>
        <View style={styles.cornerMark}>
          <FontAwesome5 name="certificate" size={17} color="#F9D549" />
          <Feather name="check" size={9} color="#0A0A0A" style={styles.cornerMarkCheck} />
        </View>
      </View>

      <ThemedText style={styles.date}>{date}</ThemedText>
      <ThemedText numberOfLines={3} style={styles.title}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 232,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  media: {
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  mediaImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  badge: {
    marginTop: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#C00019',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 600,
  },
  cornerMark: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerMarkCheck: {
    position: 'absolute',
  },
  date: {
    marginTop: 10,
    color: '#9E9E9E',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
  },
  title: {
    marginTop: 4,
    color: '#1B1B1B',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.9,
  },
});
