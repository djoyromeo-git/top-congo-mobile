import type { AuthSession, AuthUserProfile } from '@/features/auth/domain/models';

import type { TopCongoApiUser, TopCongoAuthSuccessResponse } from './top-congo-auth-contract';
import { isTopCongoValidationErrorResponse } from './top-congo-auth-contract';

export function mapTopCongoApiUserToProfile(user: TopCongoApiUser): AuthUserProfile {
  return {
    id: String(user.id),
    email: user.email,
    fullName: user.name,
    givenName: null,
    familyName: null,
    avatarUrl: null,
    emailVerified: null,
    phone: user.phone,
    gender: user.gender,
    role: user.role,
    createdAt: user.created_at,
  };
}

export function createCredentialsSession(payload: TopCongoAuthSuccessResponse): AuthSession {
  const now = new Date().toISOString();

  return {
    provider: 'credentials',
    user: mapTopCongoApiUserToProfile(payload.user),
    idToken: null,
    accessToken: payload.token,
    authorizationCode: null,
    refreshToken: null,
    issuedAt: now,
    lastAuthenticatedAt: now,
  };
}

export function getTopCongoValidationMessage(payload: unknown, fallbackMessage: string) {
  if (!isTopCongoValidationErrorResponse(payload)) {
    return fallbackMessage;
  }

  if (!payload.errors) {
    return payload.message;
  }

  for (const messages of Object.values(payload.errors)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      return messages[0];
    }
  }

  return payload.message;
}
