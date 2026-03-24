import { BookmarkSimple, Play, SealCheck } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ContentImage } from '@/components/ui/content-image';
import { useTheme } from '@/hooks/use-theme';

type ActualiteListItemProps = {
  title: string;
  imageSource: string | number;
  date?: string;
  saved: boolean;
  showDivider?: boolean;
  showPlayBadge?: boolean;
  showVerifiedBadge?: boolean;
  duration?: string;
  onPress?: () => void;
  onPressSave?: () => void;
};

export function ActualiteListItem({
  title,
  imageSource,
  date,
  saved,
  showDivider = false,
  showPlayBadge = false,
  showVerifiedBadge = false,
  duration,
  onPress,
  onPressSave,
}: ActualiteListItemProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        showDivider && {
          borderBottomColor: theme.homeChipBorder,
          borderBottomWidth: 1,
        },
      ]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <View style={styles.media}>
          <ContentImage source={imageSource} style={styles.image} />

          {showPlayBadge ? (
            <View style={styles.playBadge}>
              <Play size={14} weight="fill" color={theme.primary} />
            </View>
          ) : null}

          {duration ? (
            <View style={styles.durationPill}>
              <ThemedText style={styles.durationText}>{duration}</ThemedText>
            </View>
          ) : null}

          {showVerifiedBadge ? (
            <View style={styles.verifiedBadge}>
              <SealCheck size={18} weight="fill" color={theme.headlineAccent} />
            </View>
          ) : null}
        </View>

        <View style={styles.textBlock}>
          {date ? <ThemedText style={[styles.date, { color: theme.homeSubtitle }]}>{date}</ThemedText> : null}

          <ThemedText numberOfLines={2} style={[styles.title, { color: theme.homeTitle }]}>
            {title}
          </ThemedText>
        </View>
      </Pressable>

      <Pressable
        hitSlop={8}
        onPress={onPressSave}
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
        {saved ? (
          <BookmarkSimple size={20} weight="fill" color={theme.primary} />
        ) : (
          <BookmarkSimple size={20} weight="regular" color={theme.homeSectionLink} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  media: {
    position: 'relative',
  },
  image: {
    width: 118,
    height: 68,
    borderRadius: 6,
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: -13 }, { translateY: -13 }],
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  durationPill: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: 700,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  date: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 500,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  save: {
    width: 28,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.8,
  },
});
