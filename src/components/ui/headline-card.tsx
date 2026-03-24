import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BookmarkSimple, SealCheck } from 'phosphor-react-native';

import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

type HeadlineCardProps = {
  badge: string;
  date: string;
  title: string;
  imageSource?: number;
  fallbackVariant?: 'dark' | 'blue';
  showBadgeDot?: boolean;
  actionLabel?: string;
  actionActive?: boolean;
  onPressAction?: () => void;
  onPress?: () => void;
};

export function HeadlineCard({
  badge,
  date,
  title,
  imageSource,
  fallbackVariant = 'dark',
  showBadgeDot = false,
  actionLabel,
  actionActive = false,
  onPressAction,
  onPress,
}: HeadlineCardProps) {
  const theme = useTheme();
  const fallbackColor =
    fallbackVariant === 'blue' ? theme.homeHeadlineFallbackBlue : theme.homeHeadlineFallbackDark;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.headlineCardBackground },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.media, { backgroundColor: fallbackColor }]}>
        {imageSource ? <Image source={imageSource} style={styles.mediaImage} contentFit="cover" /> : null}
        <View style={[styles.mediaOverlay, { backgroundColor: theme.headlineMediaOverlay }]} />
        <View style={[styles.badge, { backgroundColor: theme.headlineBadgeBackground }]}>
          {showBadgeDot ? <View style={[styles.badgeDot, { backgroundColor: theme.headlineBadgeText }]} /> : null}
          <ThemedText style={[styles.badgeText, { color: theme.headlineBadgeText }]}>{badge}</ThemedText>
        </View>
        <View style={styles.cornerMark}>
          <SealCheck size={20} weight="fill" color={theme.headlineAccent} />
        </View>
      </View>

      <ThemedText style={[styles.date, { color: theme.headlineDate }]}>{date}</ThemedText>
      <ThemedText numberOfLines={3} style={[styles.title, { color: theme.headlineTitle }]}>
        {title}
      </ThemedText>

      {actionLabel ? (
        <Pressable
          onPress={onPressAction}
          style={({ pressed }) => [
            styles.actionButton,
            {
              borderColor: actionActive ? theme.primary : theme.border,
              backgroundColor: actionActive ? `${theme.primary}14` : 'transparent',
            },
            pressed && styles.pressed,
          ]}>
          {actionActive ? (
            <BookmarkSimple size={16} weight="fill" color={theme.primary} />
          ) : (
            <BookmarkSimple size={16} weight="regular" color={theme.primary} />
          )}
          <ThemedText numberOfLines={1} style={[styles.actionLabel, { color: theme.primary }]}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
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
  actionButton: {
    marginTop: 14,
    minHeight: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: 500,
  },
  pressed: {
    opacity: 0.9,
  },
});
