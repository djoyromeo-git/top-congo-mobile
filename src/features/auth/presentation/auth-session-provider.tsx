import React from 'react';

import { AuthSessionService } from '@/features/auth/application/auth-session-service';
import type {
  AuthCredentialsInput,
  AuthRegistrationCompletionInput,
  AuthOtpVerificationInput,
  AuthRegistrationInput,
  AuthRegistrationResult,
  AuthState,
  SocialAuthProvider,
} from '@/features/auth/domain/models';
import { SentryAuthLogger } from '@/features/auth/infrastructure/auth-logger';
import { ExpoAppleAuthProvider } from '@/features/auth/infrastructure/expo-apple-auth-provider';
import { ExpoGoogleAuthProvider } from '@/features/auth/infrastructure/expo-google-auth-provider';
import { FetchTopCongoAuthGateway } from '@/features/auth/infrastructure/fetch-top-congo-auth-gateway';
import { SecureStoreAuthSessionStore } from '@/features/auth/infrastructure/secure-store-auth-session-store';

type AuthSessionContextValue = {
  state: AuthState;
  signIn: (provider: SocialAuthProvider) => Promise<boolean>;
  signInWithCredentials: (input: AuthCredentialsInput) => Promise<boolean>;
  registerWithCredentials: (input: AuthRegistrationInput) => Promise<AuthRegistrationResult | null>;
  verifyRegistrationOtp: (input: AuthOtpVerificationInput) => Promise<boolean>;
  resendRegistrationOtp: (registrationId: string) => Promise<string | null>;
  completeRegistration: (input: AuthRegistrationCompletionInput) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthSessionContext = React.createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = React.useRef<AuthSessionService | null>(null);
  const [state, setState] = React.useState<AuthState>({
    isHydrated: false,
    session: null,
    isSigningIn: false,
    activeProvider: null,
    error: null,
    capabilities: {
      apple: false,
      google: false,
    },
  });

  if (!serviceRef.current) {
    serviceRef.current = new AuthSessionService(
      new SecureStoreAuthSessionStore(),
      {
        apple: new ExpoAppleAuthProvider(),
        google: new ExpoGoogleAuthProvider(),
      },
      new FetchTopCongoAuthGateway(),
      new SentryAuthLogger()
    );
  }

  React.useEffect(() => {
    const service = serviceRef.current;
    if (!service) {
      return;
    }

    const unsubscribe = service.subscribe(setState);
    void service.start();

    return unsubscribe;
  }, []);

  const value = React.useMemo<AuthSessionContextValue>(() => {
    const service = serviceRef.current;

    return {
      state,
      async signIn(provider) {
        if (!service) {
          return false;
        }

        const session = await service.signIn(provider);
        return Boolean(session);
      },
      async signInWithCredentials(input) {
        if (!service) {
          return false;
        }

        const session = await service.signInWithCredentials(input);
        return Boolean(session);
      },
      async registerWithCredentials(input) {
        if (!service) {
          return null;
        }

        return service.registerWithCredentials(input);
      },
      async verifyRegistrationOtp(input) {
        if (!service) {
          return false;
        }

        const session = await service.verifyRegistrationOtp(input);
        return Boolean(session);
      },
      async resendRegistrationOtp(registrationId) {
        if (!service) {
          return null;
        }

        return service.resendRegistrationOtp(registrationId);
      },
      async completeRegistration(input) {
        if (!service) {
          return false;
        }

        return service.completeRegistration(input);
      },
      async signOut() {
        if (!service) {
          return;
        }

        await service.signOut();
      },
      clearError() {
        service?.clearError();
      },
    };
  }, [state]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSessionContext() {
  const value = React.useContext(AuthSessionContext);

  if (!value) {
    throw new Error('useAuthSessionContext must be used within AuthSessionProvider.');
  }

  return value;
}
