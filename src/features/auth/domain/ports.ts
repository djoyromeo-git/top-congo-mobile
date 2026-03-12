import type { AuthProvider, AuthSession } from '@/features/auth/domain/models';

export type AuthCapabilityMap = Record<AuthProvider, boolean>;

export interface SocialAuthProviderPort {
  readonly provider: AuthProvider;
  isAvailableAsync(): Promise<boolean>;
  signInAsync(): Promise<AuthSession>;
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
