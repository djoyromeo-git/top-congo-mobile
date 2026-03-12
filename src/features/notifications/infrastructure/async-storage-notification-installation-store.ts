import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NotificationInstallationStore } from '@/features/notifications/domain/ports';
import type { NotificationEvent, PersistedDeviceRegistration } from '@/features/notifications/domain/models';

const DEVICE_UUID_KEY = 'topcongo.notifications.deviceUuid';
const LAST_SYNCED_REGISTRATION_KEY = 'topcongo.notifications.lastSyncedRegistration';
const LAST_HANDLED_RESPONSE_ID_KEY = 'topcongo.notifications.lastHandledResponseId';
const LAST_NOTIFICATION_EVENT_KEY = 'topcongo.notifications.lastNotificationEvent';

function parseJsonValue<T>(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export class AsyncStorageNotificationInstallationStore implements NotificationInstallationStore {
  async getDeviceUuid() {
    return AsyncStorage.getItem(DEVICE_UUID_KEY);
  }

  async saveDeviceUuid(deviceUuid: string) {
    await AsyncStorage.setItem(DEVICE_UUID_KEY, deviceUuid);
  }

  async getLastSyncedRegistration() {
    const value = await AsyncStorage.getItem(LAST_SYNCED_REGISTRATION_KEY);
    return parseJsonValue<PersistedDeviceRegistration>(value);
  }

  async saveLastSyncedRegistration(registration: PersistedDeviceRegistration) {
    await AsyncStorage.setItem(LAST_SYNCED_REGISTRATION_KEY, JSON.stringify(registration));
  }

  async getLastHandledResponseId() {
    return AsyncStorage.getItem(LAST_HANDLED_RESPONSE_ID_KEY);
  }

  async saveLastHandledResponseId(responseId: string) {
    await AsyncStorage.setItem(LAST_HANDLED_RESPONSE_ID_KEY, responseId);
  }

  async saveLastNotificationEvent(event: NotificationEvent) {
    await AsyncStorage.setItem(LAST_NOTIFICATION_EVENT_KEY, JSON.stringify(event));
  }
}
