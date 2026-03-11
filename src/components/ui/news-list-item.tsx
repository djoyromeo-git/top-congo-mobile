import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type NewsListItemProps = {
  title: string;
  imageSource: number;
  saved: boolean;
  hasBadge?: boolean;
  showDivider?: boolean;
  onPress?: () => void;
  onPressSave?: () => void;
};

export function NewsListItem({
  title,
  imageSource,
  saved,
  hasBadge = false,
  showDivider = false,
  onPress,
  onPressSave,
}: NewsListItemProps) {
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
          <Image source={imageSource} style={styles.image} contentFit="cover" transition={0} />
          {hasBadge ? (
            <View style={styles.badge}>
              <FontAwesome5 name="certificate" size={18} color={theme.headlineAccent} />
              <Feather
                name="check"
                size={9}
                color={theme.headlineAccentText}
                style={styles.badgeCheck}
              />
            </View>
          ) : null}
        </View>

        <ThemedText numberOfLines={3} style={[styles.title, { color: theme.homeTitle }]}>
          {title}
        </ThemedText>
      </Pressable>

      <Pressable
        hitSlop={8}
        onPress={onPressSave}
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
        {saved ? (
          <FontAwesome5 name="bookmark" size={18} color={theme.primary} solid />
        ) : (
          <Feather name="bookmark" size={20} color={theme.homeSectionLink} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    width: 124,
    height: 70,
    borderRadius: 6,
  },
  badge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCheck: {
    position: 'absolute',
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  save: {
    width: 24,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.8,
  },
});
