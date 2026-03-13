export type SocialAuthProvider = 'apple' | 'google';
export type AuthProvider = SocialAuthProvider | 'credentials';

export type AuthCredentialsInput = {
  email: string;
  phone: string;
  password: string;
};

export type AuthRegistrationGender = 'male' | 'female';

export type AuthRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  gender: AuthRegistrationGender;
  password: string;
  passwordConfirmation: string;
};

export type AuthUserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  givenName: string | null;
  familyName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean | null;
  phone: string | null;
  gender: AuthRegistrationGender | null;
  role: string | null;
  createdAt: string | null;
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
  | 'invalid_credentials'
  | 'validation_failed'
  | 'network'
  | 'configuration'
  | 'unknown';

export type AuthErrorDescriptor = {
  provider: AuthProvider;
  code: AuthErrorCode;
  message: string;
};
