export type AuthProvider = 'apple' | 'google';

export type AuthUserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  givenName: string | null;
  familyName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean | null;
};

export type AuthSession = {
  provider: AuthProvider;
  user: AuthUserProfile;
  idToken: string | null;
  accessToken: string | null;
  authorizationCode: string | null;
  refreshToken: string | null;
  issuedAt: string;
  lastAuthenticatedAt: string;
};

export type AuthState = {
  isHydrated: boolean;
  session: AuthSession | null;
  isSigningIn: boolean;
  activeProvider: AuthProvider | null;
  error: AuthErrorDescriptor | null;
  capabilities: {
    apple: boolean;
    google: boolean;
  };
};

export type AuthErrorCode =
  | 'cancelled'
  | 'unavailable'
  | 'misconfigured'
  | 'token_exchange_failed'
  | 'profile_fetch_failed'
  | 'unknown';

export type AuthErrorDescriptor = {
  provider: AuthProvider;
  code: AuthErrorCode;
  message: string;
};
