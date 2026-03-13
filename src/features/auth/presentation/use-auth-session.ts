import React from 'react';

import type {
  AuthCredentialsInput,
  AuthErrorDescriptor,
  AuthRegistrationInput,
  SocialAuthProvider,
} from '@/features/auth/domain/models';
import { useAuthSessionContext } from '@/features/auth/presentation/auth-session-provider';

function getErrorTranslationKey(error: AuthErrorDescriptor | null) {
  if (!error) {
    return null;
  }

  if (error.provider === 'credentials') {
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
  const context = useAuthSessionContext();

  return {
    ...context,
    session: context.state.session,
    isHydrated: context.state.isHydrated,
  };
}

export function useSocialAuth() {
  const { state, signIn, clearError } = useAuthSessionContext();

  const signInWithProvider = React.useCallback(
    async (provider: SocialAuthProvider) => {
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

export function useCredentialsAuth() {
  const { state, clearError, registerWithCredentials, signInWithCredentials, signOut } = useAuthSessionContext();

  return {
    session: state.session,
    state,
    error: state.error,
    isSubmitting: state.isSigningIn && state.activeProvider === 'credentials',
    clearError,
    signOut,
    signInWithCredentials: React.useCallback(
      async (input: AuthCredentialsInput) => {
        clearError();
        return signInWithCredentials(input);
      },
      [clearError, signInWithCredentials]
    ),
    registerWithCredentials: React.useCallback(
      async (input: AuthRegistrationInput) => {
        clearError();
        return registerWithCredentials(input);
      },
      [clearError, registerWithCredentials]
    ),
  };
}
