import type {
  AuthLogger,
  AuthSessionStore,
  CredentialsAuthGateway,
  SocialAuthProviderPort,
} from '@/features/auth/domain/ports';
import type {
  AuthCredentialsInput,
  AuthRegistrationInput,
  AuthSession,
  AuthState,
  SocialAuthProvider,
} from '@/features/auth/domain/models';
import { normalizeCredentialsAuthError, normalizeSocialAuthError } from '@/features/auth/domain/errors';

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
      phone: next.user.phone ?? existing.user.phone,
      gender: next.user.gender ?? existing.user.gender,
      role: next.user.role ?? existing.user.role,
      createdAt: next.user.createdAt ?? existing.user.createdAt,
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
    private readonly providers: Record<SocialAuthProvider, SocialAuthProviderPort>,
    private readonly credentialsGateway: CredentialsAuthGateway,
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
    const [storedSession, appleAvailable, googleAvailable] = await Promise.all([
      this.store.get(),
      this.providers.apple.isAvailableAsync(),
      this.providers.google.isAvailableAsync(),
    ]);

    const session = await this.hydrateStoredSession(storedSession);

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

  async signIn(provider: SocialAuthProvider) {
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
      this.logSessionPersisted('social_sign_in', mergedSession);

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

  async signInWithCredentials(input: AuthCredentialsInput) {
    return this.authenticateWithCredentials('auth.credentials_sign_in', () =>
      this.credentialsGateway.signInWithCredentials(input)
    );
  }

  async registerWithCredentials(input: AuthRegistrationInput) {
    return this.authenticateWithCredentials('auth.credentials_register', () => this.credentialsGateway.register(input));
  }

  async signOut() {
    const currentSession = this.state.session;

    if (currentSession?.provider === 'credentials' && currentSession.accessToken) {
      try {
        await this.credentialsGateway.logout(currentSession.accessToken);
      } catch (error) {
        this.logger.warn('auth.sign_out_remote_failed', {
          provider: currentSession.provider,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

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

  private async hydrateStoredSession(session: AuthSession | null) {
    if (!session || session.provider !== 'credentials' || !session.accessToken) {
      return session;
    }

    try {
      const profile = await this.credentialsGateway.fetchProfile(session.accessToken);
      const nextSession = mergeSessionWithExisting(session, {
        ...session,
        user: profile,
      });

      await this.store.set(nextSession);
      this.logSessionPersisted('session_hydration', nextSession);

      return nextSession;
    } catch (error) {
      this.logger.warn('auth.session_hydration_profile_failed', {
        provider: session.provider,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      return session;
    }
  }

  private async authenticateWithCredentials(action: string, operation: () => Promise<AuthSession>) {
    if (this.state.isSigningIn) {
      return null;
    }

    this.setState({
      ...this.state,
      isSigningIn: true,
      activeProvider: 'credentials',
      error: null,
    });

    try {
      const nextSession = await operation();
      const mergedSession = mergeSessionWithExisting(this.state.session, nextSession);
      await this.store.set(mergedSession);
      this.logSessionPersisted(action, mergedSession);

      this.logger.info(`${action}_succeeded`, {
        provider: mergedSession.provider,
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
      const normalizedError = normalizeCredentialsAuthError(error);

      this.logger.error(`${action}_failed`, normalizedError, {
        provider: normalizedError.provider,
        code: normalizedError.code,
      });

      this.setState({
        ...this.state,
        isSigningIn: false,
        activeProvider: null,
        error: normalizedError.toDescriptor(),
      });

      return null;
    }
  }

  private logSessionPersisted(reason: string, session: AuthSession) {
    const context = {
      reason,
      provider: session.provider,
      userId: session.user.id,
      fullName: session.user.fullName,
      email: session.user.email,
      hasAccessToken: Boolean(session.accessToken),
      issuedAt: session.issuedAt,
      lastAuthenticatedAt: session.lastAuthenticatedAt,
    };

    this.logger.debug('auth.session_saved', context);

    if (__DEV__) {
      console.info('[auth] session saved', context);
    }
  }
}
