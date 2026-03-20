import { ArrowsInSimple, ArrowsOutSimple, Pause, Play, SpeakerHigh, SpeakerX } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Spacing } from '@/constants/theme';

type MediaControlsProps = {
  playing: boolean;
  muted: boolean;
  onTogglePlay?: () => void;
  onToggleMute?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  timeLabel: string;
  disabled?: boolean;
  showExpand?: boolean;
};

export function MediaControls({
  playing,
  muted,
  onTogglePlay,
  onToggleMute,
  expanded = false,
  onToggleExpand,
  timeLabel,
  disabled = false,
  showExpand = true,
}: MediaControlsProps) {
  return (
    <View style={[styles.controlsRow, disabled && styles.disabled]}>
      <IconButton
        icon={playing ? 'pause' : 'play'}
        onPress={onTogglePlay}
        accessibilityLabel={playing ? 'Pause' : 'Lecture'}
        disabled={disabled}
      />

      <IconButton
        icon={muted ? 'volume-x' : 'volume-high'}
        onPress={onToggleMute}
        accessibilityLabel={muted ? 'Remettre le son' : 'Couper le son'}
        disabled={disabled}
      />

      <View style={styles.timePill}>
        <ThemedText numberOfLines={1} style={styles.timeText}>
          {timeLabel}
        </ThemedText>
      </View>

      <View style={styles.spacer} />
      {showExpand ? (
        <IconButton
          icon={expanded ? 'collapse' : 'expand'}
          onPress={onToggleExpand}
          accessibilityLabel={expanded ? 'Réduire' : 'Agrandir'}
          disabled={disabled}
        />
      ) : null}
    </View>
  );
}

type IconKind = 'play' | 'pause' | 'volume-high' | 'volume-x' | 'expand' | 'collapse';

function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  disabled,
}: {
  icon: IconKind;
  onPress?: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && styles.iconButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {{
        play: <Play size={20} weight="fill" color={Palette.neutral['100']} />,
        pause: <Pause size={20} weight="fill" color={Palette.neutral['100']} />,
        'volume-high': <SpeakerHigh size={20} weight="bold" color={Palette.neutral['100']} />,
        'volume-x': <SpeakerX size={20} weight="bold" color={Palette.neutral['100']} />,
        expand: <ArrowsOutSimple size={20} weight="bold" color={Palette.neutral['100']} />,
        collapse: <ArrowsInSimple size={20} weight="bold" color={Palette.neutral['100']} />,
      }[icon]}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  timePill: {
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: Palette.neutral['100'],
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  pressed: { opacity: 0.8 },
});
