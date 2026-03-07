import { useEffect, useState } from 'react';
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

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  if (lockedColorScheme) {
    return lockedColorScheme;
  }

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme === 'dark' ? 'dark' : 'light';
  }

  return 'light';
}
