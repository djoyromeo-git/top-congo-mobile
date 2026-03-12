import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { SocialAuthError } from '@/features/auth/domain/errors';
import type { AuthSession } from '@/features/auth/domain/models';
import type { SocialAuthProviderPort } from '@/features/auth/domain/ports';

function formatName(fullName: AppleAuthentication.AppleAuthenticationFullName | null) {
  if (!fullName) {
    return null;
  }

  const parts = [fullName.givenName, fullName.middleName, fullName.familyName]
    .map(value => value?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : null;
}

export class ExpoAppleAuthProvider implements SocialAuthProviderPort {
  readonly provider = 'apple' as const;

  async isAvailableAsync() {
    if (Platform.OS !== 'ios') {
      return false;
    }

    return AppleAuthentication.isAvailableAsync();
  }

  async signInAsync(): Promise<AuthSession> {
    const isAvailable = await this.isAvailableAsync();
    if (!isAvailable) {
      throw new SocialAuthError(this.provider, 'unavailable', 'Apple sign-in is not available on this device.');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: Crypto.randomUUID(),
        state: Crypto.randomUUID(),
      });

      const now = new Date().toISOString();

      return {
        provider: this.provider,
        user: {
          id: credential.user,
          email: credential.email?.trim() ?? null,
          fullName: formatName(credential.fullName),
          givenName: credential.fullName?.givenName?.trim() ?? null,
          familyName: credential.fullName?.familyName?.trim() ?? null,
          avatarUrl: null,
          emailVerified: null,
        },
        idToken: credential.identityToken,
        accessToken: null,
        authorizationCode: credential.authorizationCode,
        refreshToken: null,
        issuedAt: now,
        lastAuthenticatedAt: now,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('ERR_REQUEST_CANCELED')) {
        throw new SocialAuthError(this.provider, 'cancelled', 'Apple sign-in was cancelled.');
      }

      throw error;
    }
  }
}
