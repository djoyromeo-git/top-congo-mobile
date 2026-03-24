import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseStoredJsonValue } from '@/shared/storage/json-storage';

export class AsyncStorageJsonStore<T> {
  constructor(private readonly key: string) {}

  async get() {
    const value = await AsyncStorage.getItem(this.key);
    return parseStoredJsonValue<T>(value);
  }

  async set(value: T) {
    await AsyncStorage.setItem(this.key, JSON.stringify(value));
  }

  async clear() {
    await AsyncStorage.removeItem(this.key);
  }
}
