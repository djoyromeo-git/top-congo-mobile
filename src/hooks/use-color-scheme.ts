import { useColorScheme as useRNColorScheme } from 'react-native';

export type AppColorScheme = 'light' | 'dark';

const lockedSchemeValue = process.env.EXPO_PUBLIC_THEME_LOCKED_SCHEME?.toLowerCase();

function getLockedColorScheme(): AppColorScheme | null {
  if (lockedSchemeValue === 'light' || lockedSchemeValue === 'dark') {
    return lockedSchemeValue;
  }

  return null;
}

const lockedColorScheme = getLockedColorScheme();
export const isColorSchemeLocked = lockedColorScheme !== null;

export function useColorScheme(): AppColorScheme {
  const scheme = useRNColorScheme();
  return lockedColorScheme ?? (scheme === 'dark' ? 'dark' : 'light');
}
