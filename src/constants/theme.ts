/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Scale convention used everywhere:
// 100 = lightest tone, 800 = darkest tone.
export const Palette = {
  blue: {
    '100': '#FFFFFF',
    '200': '#E1E1F0',
    '300': '#C4C4E1',
    '400': '#A6A8D3',
    '500': '#888CC4',
    '600': '#6972B5',
    '700': '#4759A6',
    '800': '#174197',
  },
  red: {
    '100': '#FFFFFF',
    '200': '#FBDFDA',
    '300': '#F4C0B7',
    '400': '#EBA094',
    '500': '#DF8173',
    '600': '#D26153',
    '700': '#C23D35',
    '800': '#B10018',
  },
  blueShade: {
    '100': '#174197',
    '200': '#1B3880',
    '300': '#1B2F6A',
    '400': '#1A2754',
    '500': '#181F40',
    '600': '#14172C',
    '700': '#0E0E1A',
    '800': '#000000',
  },
  redShade: {
    '100': '#B10018',
    '200': '#960D16',
    '300': '#7D1214',
    '400': '#641412',
    '500': '#4C140F',
    '600': '#35110B',
    '700': '#200C05',
    '800': '#000000',
  },
  neutral: {
    '100': '#FFFFFF',
    '200': '#D6D6D6',
    '300': '#AFAFAF',
    '400': '#898989',
    '500': '#656565',
    '600': '#434343',
    '700': '#242424',
    '800': '#000000',
  },
} as const;

export const Colors = {
  light: {
    text: Palette.neutral['800'],
    textSecondary: Palette.neutral['500'],
    background: Palette.neutral['100'],
    backgroundElement: Palette.blue['200'],
    backgroundSelected: Palette.blue['300'],
    primary: Palette.blue['800'],
    primaryMuted: Palette.blue['600'],
    danger: Palette.red['800'],
    dangerMuted: Palette.red['600'],
    border: Palette.neutral['300'],
  },
  dark: {
    text: Palette.neutral['100'],
    textSecondary: Palette.neutral['300'],
    background: Palette.neutral['800'],
    backgroundElement: Palette.blueShade['700'],
    backgroundSelected: Palette.blueShade['600'],
    primary: Palette.blueShade['100'],
    primaryMuted: Palette.blueShade['300'],
    danger: Palette.redShade['100'],
    dangerMuted: Palette.redShade['300'],
    border: Palette.neutral['600'],
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Google Sans',
    serif: 'Google Sans',
    rounded: 'Google Sans',
    mono: 'Google Sans',
  },
  default: {
    sans: 'Google Sans',
    serif: 'Google Sans',
    rounded: 'Google Sans',
    mono: 'Google Sans',
  },
  web: {
    sans: 'Google Sans',
    serif: 'Google Sans',
    rounded: 'Google Sans',
    mono: 'Google Sans',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
