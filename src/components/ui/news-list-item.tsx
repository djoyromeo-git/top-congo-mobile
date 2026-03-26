import { BookmarkSimple, Play } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ContentImage } from '@/components/ui/content-image';
import { useTheme } from '@/hooks/use-theme';

import { SavedForLaterActiveIcon } from './saved-for-later-active-icon';

type NewsListItemProps = {
  title: string;
  imageSource: string | number;
  saved: boolean;
  hasBadge?: boolean;
  showDivider?: boolean;
  date?: string;
  onPress?: () => void;
  onPressSave?: () => void;
};

export function NewsListItem({
  title,
  imageSource,
  saved,
  hasBadge = false,
  showDivider = false,
  date,
  onPress,
  onPressSave,
}: NewsListItemProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.item,
        showDivider && {
          borderBottomColor: theme.homeChipBorder,
          borderBottomWidth: 1,
        },
      ]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.media}>
          <ContentImage source={imageSource} style={styles.image} />
          {hasBadge ? (
            <View style={[styles.playBadge, { backgroundColor: theme.headlineAccent }]}>
              <Play size={14} weight="fill" color={theme.headlineAccentText} />
            </View>
          ) : null}
        </View>

        <View style={styles.textBlock}>
          <View style={styles.metaRow}>
            {date ? <ThemedText style={[styles.date, { color: theme.homeSubtitle }]}>{date}</ThemedText> : <View />}

            <Pressable
              hitSlop={8}
              onPress={onPressSave}
              style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
              {saved ? (
                <SavedForLaterActiveIcon width={15} height={20} color={theme.primary} />
              ) : (
                <BookmarkSimple size={20} weight="regular" color={theme.homeSectionLink} />
              )}
            </Pressable>
          </View>

          <ThemedText numberOfLines={2} style={[styles.title, { color: theme.homeTitle }]}>
            {title}
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  media: {
    position: 'relative',
  },
  image: {
    width: 124,
    height: 70,
    borderRadius: 6,
  },
  playBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    transform: [{ translateX: -12 }, { translateY: -12 }],
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  date: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 500,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  save: {
    width: 28,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.8,
  },
});
