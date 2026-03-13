import { AUTH_SESSION_STORAGE_KEY } from '@/features/auth/config';
import type { AuthSession } from '@/features/auth/domain/models';
import type { AuthSessionStore } from '@/features/auth/domain/ports';
import { SecureStoreJsonStore } from '@/shared/storage/secure-store-json-store';

export class SecureStoreAuthSessionStore implements AuthSessionStore {
  private readonly store = new SecureStoreJsonStore<AuthSession>(AUTH_SESSION_STORAGE_KEY);

  async get() {
    return this.store.get();
  }

  async set(session: AuthSession) {
    await this.store.set(session);
  }

  async clear() {
    await this.store.clear();
  }
}
