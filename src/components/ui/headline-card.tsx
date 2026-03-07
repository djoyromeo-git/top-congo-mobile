import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';

import { useTheme } from '@/hooks/use-theme';

type HeadlineCardProps = {
  badge: string;
  date: string;
  title: string;
  imageSource?: number;
  fallbackVariant?: 'dark' | 'blue';
  onPress?: () => void;
};

export function HeadlineCard({
  badge,
  date,
  title,
  imageSource,
  fallbackVariant = 'dark',
  onPress,
}: HeadlineCardProps) {
  const theme = useTheme();
  const fallbackColor =
    fallbackVariant === 'blue' ? theme.homeHeadlineFallbackBlue : theme.homeHeadlineFallbackDark;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.headlineCardBackground }, pressed && styles.pressed]}>
      <View style={[styles.media, { backgroundColor: fallbackColor }]}>
        {imageSource ? <Image source={imageSource} style={styles.mediaImage} contentFit="cover" /> : null}
        <View style={[styles.mediaOverlay, { backgroundColor: theme.headlineMediaOverlay }]} />
        <View style={[styles.badge, { backgroundColor: theme.headlineBadgeBackground }]}>
          <ThemedText style={[styles.badgeText, { color: theme.headlineBadgeText }]}>• {badge}</ThemedText>
        </View>
        <View style={styles.cornerMark}>
          <FontAwesome5 name="certificate" size={17} color={theme.headlineAccent} />
          <Feather name="check" size={9} color={theme.headlineAccentText} style={styles.cornerMarkCheck} />
        </View>
      </View>

      <ThemedText style={[styles.date, { color: theme.headlineDate }]}>{date}</ThemedText>
      <ThemedText numberOfLines={3} style={[styles.title, { color: theme.headlineTitle }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 232,
    borderRadius: 12,
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
  },
  badge: {
    marginTop: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
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
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
  },
  title: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.9,
  },
});

