import type {
  AuthErrorCode,
  AuthErrorDescriptor,
  AuthProvider,
  SocialAuthProvider,
} from '@/features/auth/domain/models';

export class SocialAuthError extends Error {
  readonly provider: AuthProvider;
  readonly code: AuthErrorCode;

  constructor(provider: AuthProvider, code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'SocialAuthError';
    this.provider = provider;
    this.code = code;
  }

  toDescriptor(): AuthErrorDescriptor {
    return {
      provider: this.provider,
      code: this.code,
      message: this.message,
    };
  }
}

export function normalizeSocialAuthError(error: unknown, provider: SocialAuthProvider) {
  if (error instanceof SocialAuthError) {
    return error;
  }

  if (error instanceof Error) {
    return new SocialAuthError(provider, 'unknown', error.message);
  }

  return new SocialAuthError(provider, 'unknown', 'Unknown social authentication error.');
}

export class CredentialsAuthError extends Error {
  readonly provider = 'credentials' as const;
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'CredentialsAuthError';
    this.code = code;
  }

  toDescriptor(): AuthErrorDescriptor {
    return {
      provider: this.provider,
      code: this.code,
      message: this.message,
    };
  }
}

export function normalizeCredentialsAuthError(error: unknown) {
  if (error instanceof CredentialsAuthError) {
    return error;
  }

  if (error instanceof Error) {
    return new CredentialsAuthError('unknown', error.message);
  }

  return new CredentialsAuthError('unknown', 'Unknown credentials authentication error.');
}
