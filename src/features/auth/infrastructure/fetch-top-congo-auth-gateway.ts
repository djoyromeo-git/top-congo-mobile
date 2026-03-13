import { getTopCongoApiUrl } from '@/features/auth/config';
import { CredentialsAuthError } from '@/features/auth/domain/errors';
import type { AuthCredentialsInput, AuthRegistrationInput } from '@/features/auth/domain/models';
import type { CredentialsAuthGateway } from '@/features/auth/domain/ports';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';
import {
  createCredentialsSession,
  getTopCongoValidationMessage,
  mapTopCongoApiUserToProfile,
} from '@/features/auth/infrastructure/top-congo-auth-mapper';
import {
  isTopCongoApiUser,
  isTopCongoAuthSuccessResponse,
} from '@/features/auth/infrastructure/top-congo-auth-contract';

type RequestOptions = {
  method?: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  accessToken?: string;
};

export class FetchTopCongoAuthGateway implements CredentialsAuthGateway {
  private readonly httpClient = createHttpClient({
    baseUrl: getTopCongoApiUrl(),
  });

  async signInWithCredentials(input: AuthCredentialsInput) {
    const payload = await this.request({
      path: '/auth/login',
      body: {
        email: input.email,
        phone: input.phone,
        password: input.password,
      },
    });

    if (!isTopCongoAuthSuccessResponse(payload)) {
      throw new CredentialsAuthError('unknown', 'Unexpected login response from TopCongo API.');
    }

    return createCredentialsSession(payload);
  }

  async register(input: AuthRegistrationInput) {
    const payload = await this.request({
      path: '/auth/register',
      body: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        gender: input.gender,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    });

    if (!isTopCongoAuthSuccessResponse(payload)) {
      throw new CredentialsAuthError('unknown', 'Unexpected registration response from TopCongo API.');
    }

    return createCredentialsSession(payload);
  }

  async logout(accessToken: string) {
    await this.request({
      path: '/auth/logout',
      accessToken,
    });
  }

  async fetchProfile(accessToken: string) {
    const payload = await this.request({
      method: 'GET',
      path: '/auth/profile',
      accessToken,
    });

    if (!isTopCongoApiUser(payload)) {
      throw new CredentialsAuthError('profile_fetch_failed', 'Unexpected profile response from TopCongo API.');
    }

    return mapTopCongoApiUserToProfile(payload);
  }

  private async request({ method = 'POST', path, body, accessToken }: RequestOptions) {
    try {
      return await this.httpClient.request<unknown>({
        method,
        path,
        body,
        accessToken,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'configuration') {
          throw new CredentialsAuthError('configuration', 'Missing EXPO_PUBLIC_API_URL for TopCongo API.');
        }

        if (error.code === 'network' || error.code === 'timeout') {
          throw new CredentialsAuthError('network', 'Impossible de contacter le serveur TopCongo.');
        }

        if (error.status === 422 && path === '/auth/login') {
          throw new CredentialsAuthError(
            'invalid_credentials',
            getTopCongoValidationMessage(error.body, 'These credentials do not match our records.')
          );
        }

        if (error.status === 422) {
          throw new CredentialsAuthError(
            'validation_failed',
            getTopCongoValidationMessage(error.body, 'Validation failed.')
          );
        }

        if (error.status === 401 || error.status === 403) {
          throw new CredentialsAuthError('invalid_credentials', 'Authentication failed.');
        }

        throw new CredentialsAuthError(
          'unknown',
          error.message || 'Authentication request failed.'
        );
      }

      throw error;
    }
  }
}
