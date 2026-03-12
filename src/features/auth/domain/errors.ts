import type { AuthErrorCode, AuthErrorDescriptor, AuthProvider } from '@/features/auth/domain/models';

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

export function normalizeSocialAuthError(error: unknown, provider: AuthProvider) {
  if (error instanceof SocialAuthError) {
    return error;
  }

  if (error instanceof Error) {
    return new SocialAuthError(provider, 'unknown', error.message);
  }

  return new SocialAuthError(provider, 'unknown', 'Unknown social authentication error.');
}
