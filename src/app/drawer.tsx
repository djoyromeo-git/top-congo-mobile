import React from 'react';
import { Stack, useRouter } from 'expo-router';

import { useDrawer } from '@/components/ui/drawer-context';

/**
 * Legacy /drawer route kept for backward compatibility.
 * We no longer use a separate drawer screen; the shared overlay is rendered
 * from the app layout. If this route is hit directly, open the overlay and
 * return to the main tab stack.
 */
export default function DrawerRedirect() {
  const drawer = useDrawer();
  const router = useRouter();

  React.useEffect(() => {
    drawer.open();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [drawer, router]);

  return <Stack.Screen options={{ headerShown: false }} />;
}
