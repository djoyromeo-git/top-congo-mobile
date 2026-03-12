import React from 'react';

import type { AuthErrorDescriptor, AuthProvider } from '@/features/auth/domain/models';
import { useAuthSessionContext } from '@/features/auth/presentation/auth-session-provider';

function getErrorTranslationKey(error: AuthErrorDescriptor | null) {
  if (!error) {
    return null;
  }

  if (error.provider === 'apple' && error.code === 'unavailable') {
    return 'auth.appleUnavailable';
  }

  if (error.provider === 'google' && error.code === 'misconfigured') {
    return 'auth.googleUnavailable';
  }

  return 'auth.socialAuthFailed';
}

export function useAuthSession() {
  return useAuthSessionContext();
}

export function useSocialAuth() {
  const { state, signIn, clearError } = useAuthSessionContext();

  const signInWithProvider = React.useCallback(
    async (provider: AuthProvider) => {
      clearError();
      return signIn(provider);
    },
    [clearError, signIn]
  );

  return {
    session: state.session,
    isHydrated: state.isHydrated,
    isSigningIn: state.isSigningIn,
    activeProvider: state.activeProvider,
    error: state.error,
    errorTranslationKey: getErrorTranslationKey(state.error),
    capabilities: state.capabilities,
    signInWithApple: React.useCallback(() => signInWithProvider('apple'), [signInWithProvider]),
    signInWithGoogle: React.useCallback(() => signInWithProvider('google'), [signInWithProvider]),
    clearError,
  };
}
