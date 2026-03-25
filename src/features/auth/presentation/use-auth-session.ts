import React from 'react';

import type {
  AuthCredentialsInput,
  AuthErrorDescriptor,
  AuthOtpVerificationInput,
  AuthRegistrationCompletionInput,
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

  if (error.provider === 'google' && error.code === 'token_exchange_failed') {
    return 'auth.googleExchangeFailed';
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
    errorMessage: state.error?.message ?? null,
    errorTranslationKey: getErrorTranslationKey(state.error),
    capabilities: state.capabilities,
    signInWithApple: React.useCallback(() => signInWithProvider('apple'), [signInWithProvider]),
    signInWithGoogle: React.useCallback(() => signInWithProvider('google'), [signInWithProvider]),
    clearError,
  };
}

export function useCredentialsAuth() {
  const {
    state,
    clearError,
    completeRegistration,
    registerWithCredentials,
    resendRegistrationOtp,
    signInWithCredentials,
    signOut,
    updatePreferences,
    verifyRegistrationOtp,
  } = useAuthSessionContext();

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
    verifyRegistrationOtp: React.useCallback(
      async (input: AuthOtpVerificationInput) => {
        clearError();
        return verifyRegistrationOtp(input);
      },
      [clearError, verifyRegistrationOtp]
    ),
    resendRegistrationOtp: React.useCallback(
      async (registrationId: string) => {
        clearError();
        return resendRegistrationOtp(registrationId);
      },
      [clearError, resendRegistrationOtp]
    ),
    completeRegistration: React.useCallback(
      async (input: AuthRegistrationCompletionInput) => {
        clearError();
        return completeRegistration(input);
      },
      [clearError, completeRegistration]
    ),
    updatePreferences: React.useCallback(
      async (categoryIds: string[]) => {
        clearError();
        return updatePreferences(categoryIds);
      },
      [clearError, updatePreferences]
    ),
  };
}
