import { Redirect } from 'expo-router';

import { useAuthSession } from '@/features/auth/presentation/use-auth-session';

export default function AppEntryScreen() {
  const { isHydrated, session } = useAuthSession();

  if (!isHydrated) {
    return null;
  }

  return <Redirect href={session ? '/(tabs)' : '/onboarding'} />;
}
