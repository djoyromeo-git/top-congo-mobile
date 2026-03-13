import * as SecureStore from 'expo-secure-store';

import { parseStoredJsonValue } from '@/shared/storage/json-storage';

type SecureStoreJsonStoreOptions = {
  keychainAccessible?: SecureStore.KeychainAccessibilityConstant;
};

export class SecureStoreJsonStore<T> {
  constructor(
    private readonly key: string,
    private readonly options: SecureStoreJsonStoreOptions = {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }
  ) {}

  async get() {
    const value = await SecureStore.getItemAsync(this.key);
    return parseStoredJsonValue<T>(value);
  }

  async set(value: T) {
    await SecureStore.setItemAsync(this.key, JSON.stringify(value), this.options);
  }

  async clear() {
    await SecureStore.deleteItemAsync(this.key);
  }
}
