import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
    if (Platform.OS === 'web') {
      const value = await AsyncStorage.getItem(this.key);
      return parseStoredJsonValue<T>(value);
    }

    const value = await SecureStore.getItemAsync(this.key);
    return parseStoredJsonValue<T>(value);
  }

  async set(value: T) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(this.key, JSON.stringify(value));
      return;
    }

    await SecureStore.setItemAsync(this.key, JSON.stringify(value), this.options);
  }

  async clear() {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(this.key);
      return;
    }

    await SecureStore.deleteItemAsync(this.key);
  }
}
