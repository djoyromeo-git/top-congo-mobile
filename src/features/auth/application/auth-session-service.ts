import type { AuthSessionStore, AuthLogger, SocialAuthProviderPort } from '@/features/auth/domain/ports';
import type { AuthProvider, AuthSession, AuthState } from '@/features/auth/domain/models';
import { normalizeSocialAuthError } from '@/features/auth/domain/errors';

type AuthStateListener = (state: AuthState) => void;

const INITIAL_AUTH_STATE: AuthState = {
  isHydrated: false,
  session: null,
  isSigningIn: false,
  activeProvider: null,
  error: null,
  capabilities: {
    apple: false,
    google: false,
  },
};

function mergeSessionWithExisting(existing: AuthSession | null, next: AuthSession) {
  if (!existing || existing.provider !== next.provider || existing.user.id !== next.user.id) {
    return next;
  }

  return {
    ...next,
    user: {
      ...next.user,
      email: next.user.email ?? existing.user.email,
      fullName: next.user.fullName ?? existing.user.fullName,
      givenName: next.user.givenName ?? existing.user.givenName,
      familyName: next.user.familyName ?? existing.user.familyName,
      avatarUrl: next.user.avatarUrl ?? existing.user.avatarUrl,
      emailVerified: next.user.emailVerified ?? existing.user.emailVerified,
    },
    idToken: next.idToken ?? existing.idToken,
    accessToken: next.accessToken ?? existing.accessToken,
    authorizationCode: next.authorizationCode ?? existing.authorizationCode,
    refreshToken: next.refreshToken ?? existing.refreshToken,
  };
}

export class AuthSessionService {
  private started = false;
  private state: AuthState = INITIAL_AUTH_STATE;
  private readonly listeners = new Set<AuthStateListener>();

  constructor(
    private readonly store: AuthSessionStore,
    private readonly providers: Record<AuthProvider, SocialAuthProviderPort>,
    private readonly logger: AuthLogger
  ) {}

  getState() {
    return this.state;
  }

  subscribe(listener: AuthStateListener) {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async start() {
    if (this.started) {
      return;
    }

    this.started = true;
    const [session, appleAvailable, googleAvailable] = await Promise.all([
      this.store.get(),
      this.providers.apple.isAvailableAsync(),
      this.providers.google.isAvailableAsync(),
    ]);

    this.setState({
      ...this.state,
      isHydrated: true,
      session,
      capabilities: {
        apple: appleAvailable,
        google: googleAvailable,
      },
    });
  }

  async signIn(provider: AuthProvider) {
    const authProvider = this.providers[provider];

    if (!authProvider || this.state.isSigningIn) {
      return null;
    }

    this.setState({
      ...this.state,
      isSigningIn: true,
      activeProvider: provider,
      error: null,
    });

    try {
      const nextSession = await authProvider.signInAsync();
      const mergedSession = mergeSessionWithExisting(this.state.session, nextSession);
      await this.store.set(mergedSession);

      this.logger.info('auth.sign_in_succeeded', {
        provider,
        userId: mergedSession.user.id,
      });

      this.setState({
        ...this.state,
        session: mergedSession,
        isSigningIn: false,
        activeProvider: null,
        error: null,
      });

      return mergedSession;
    } catch (error) {
      const normalizedError = normalizeSocialAuthError(error, provider);

      if (normalizedError.code !== 'cancelled') {
        this.logger.error('auth.sign_in_failed', normalizedError, {
          provider,
          code: normalizedError.code,
        });
      } else {
        this.logger.debug('auth.sign_in_cancelled', {
          provider,
        });
      }

      this.setState({
        ...this.state,
        isSigningIn: false,
        activeProvider: null,
        error: normalizedError.code === 'cancelled' ? null : normalizedError.toDescriptor(),
      });

      return null;
    }
  }

  async signOut() {
    await this.store.clear();

    this.setState({
      ...this.state,
      session: null,
      error: null,
    });
  }

  clearError() {
    if (!this.state.error) {
      return;
    }

    this.setState({
      ...this.state,
      error: null,
    });
  }

  private setState(nextState: AuthState) {
    this.state = nextState;

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
