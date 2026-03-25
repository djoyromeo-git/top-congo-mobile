import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

import { GOOGLE_AUTH_SCOPES, getGoogleAuthConfiguration } from '@/features/auth/config';
import { SocialAuthError } from '@/features/auth/domain/errors';
import type { AuthSession } from '@/features/auth/domain/models';
import type { SocialAuthProviderPort } from '@/features/auth/domain/ports';

export class ExpoGoogleAuthProvider implements SocialAuthProviderPort {
  readonly provider = 'google' as const;
  private configured = false;

  async isAvailableAsync() {
    const config = getGoogleAuthConfiguration();
    return Boolean(config.webClientId || config.iosClientId);
  }

  async signInAsync(): Promise<AuthSession> {
    const config = getGoogleAuthConfiguration();
    if (!config.webClientId && !config.iosClientId) {
      throw new SocialAuthError(this.provider, 'misconfigured', 'Google Sign-In is not configured.');
    }

    this.ensureConfigured();

    if (Platform.OS === 'android') {
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      } catch (error) {
        throw new SocialAuthError(
          this.provider,
          'unavailable',
          error instanceof Error ? error.message : 'Google Play Services are unavailable.'
        );
      }
    }

    try {
      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) {
        throw new SocialAuthError(this.provider, 'cancelled', 'Google sign-in was cancelled.');
      }

      if (!isSuccessResponse(response)) {
        throw new SocialAuthError(this.provider, 'unknown', 'Google sign-in did not complete successfully.');
      }

      const tokens = await GoogleSignin.getTokens();
      const now = new Date().toISOString();

      return {
        provider: this.provider,
        user: {
          id: response.data.user.id,
          email: response.data.user.email?.trim() ?? null,
          fullName: response.data.user.name?.trim() ?? null,
          givenName: response.data.user.givenName?.trim() ?? null,
          familyName: response.data.user.familyName?.trim() ?? null,
          avatarUrl: response.data.user.photo?.trim() ?? null,
          emailVerified: true,
          phone: null,
          gender: null,
          role: null,
          createdAt: null,
        },
        idToken: tokens.idToken ?? response.data.idToken ?? null,
        accessToken: tokens.accessToken ?? null,
        authorizationCode: response.data.serverAuthCode ?? null,
        refreshToken: null,
        issuedAt: now,
        lastAuthenticatedAt: now,
      };
    } catch (error) {
      if (error instanceof SocialAuthError) {
        throw error;
      }

      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new SocialAuthError(this.provider, 'cancelled', 'Google sign-in was cancelled.');
        }

        if (error.code === statusCodes.IN_PROGRESS) {
          throw new SocialAuthError(this.provider, 'cancelled', 'Google sign-in is already in progress.');
        }

        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new SocialAuthError(this.provider, 'unavailable', 'Google Play Services are unavailable.');
        }
      }

      throw error;
    }
  }

  private ensureConfigured() {
    if (this.configured) {
      return;
    }

    const config = getGoogleAuthConfiguration();

    GoogleSignin.configure({
      scopes: GOOGLE_AUTH_SCOPES,
      iosClientId: config.iosClientId,
      webClientId: config.webClientId,
      offlineAccess: true,
    });

    this.configured = true;
  }
}
