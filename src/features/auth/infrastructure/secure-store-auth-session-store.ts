import * as SecureStore from 'expo-secure-store';

import { AUTH_SESSION_STORAGE_KEY } from '@/features/auth/config';
import type { AuthSession } from '@/features/auth/domain/models';
import type { AuthSessionStore } from '@/features/auth/domain/ports';

export class SecureStoreAuthSessionStore implements AuthSessionStore {
  async get() {
    const value = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as AuthSession;
  }

  async set(session: AuthSession) {
    await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async clear() {
    await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY);
  }
}
