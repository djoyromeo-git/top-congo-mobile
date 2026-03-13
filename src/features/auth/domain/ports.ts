import type {
  AuthCredentialsInput,
  AuthRegistrationInput,
  AuthSession,
  AuthUserProfile,
  SocialAuthProvider,
} from '@/features/auth/domain/models';

export type AuthCapabilityMap = Record<SocialAuthProvider, boolean>;

export interface SocialAuthProviderPort {
  readonly provider: SocialAuthProvider;
  isAvailableAsync(): Promise<boolean>;
  signInAsync(): Promise<AuthSession>;
}

export interface CredentialsAuthGateway {
  signInWithCredentials(input: AuthCredentialsInput): Promise<AuthSession>;
  register(input: AuthRegistrationInput): Promise<AuthSession>;
  fetchProfile(accessToken: string): Promise<AuthUserProfile>;
  logout(accessToken: string): Promise<void>;
}

export interface AuthSessionStore {
  get(): Promise<AuthSession | null>;
  set(session: AuthSession): Promise<void>;
  clear(): Promise<void>;
}

export interface AuthLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error: unknown, context?: Record<string, unknown>): void;
}
