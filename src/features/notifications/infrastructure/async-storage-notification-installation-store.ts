import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NotificationInstallationStore } from '@/features/notifications/domain/ports';
import type { NotificationEvent, PersistedDeviceRegistration } from '@/features/notifications/domain/models';
import { AsyncStorageJsonStore } from '@/shared/storage/async-storage-json-store';
import { createVersionedStorageKey } from '@/shared/storage/storage-keys';

const DEVICE_UUID_KEY = createVersionedStorageKey('notifications', 'deviceUuid', 1);
const LAST_SYNCED_REGISTRATION_KEY = createVersionedStorageKey('notifications', 'lastSyncedRegistration', 1);
const LAST_HANDLED_RESPONSE_ID_KEY = createVersionedStorageKey('notifications', 'lastHandledResponseId', 1);
const LAST_NOTIFICATION_EVENT_KEY = createVersionedStorageKey('notifications', 'lastNotificationEvent', 1);

export class AsyncStorageNotificationInstallationStore implements NotificationInstallationStore {
  private readonly lastSyncedRegistrationStore = new AsyncStorageJsonStore<PersistedDeviceRegistration>(
    LAST_SYNCED_REGISTRATION_KEY
  );
  private readonly lastNotificationEventStore = new AsyncStorageJsonStore<NotificationEvent>(LAST_NOTIFICATION_EVENT_KEY);

  async getDeviceUuid() {
    return AsyncStorage.getItem(DEVICE_UUID_KEY);
  }

  async saveDeviceUuid(deviceUuid: string) {
    await AsyncStorage.setItem(DEVICE_UUID_KEY, deviceUuid);
  }

  async getLastSyncedRegistration() {
    return this.lastSyncedRegistrationStore.get();
  }

  async saveLastSyncedRegistration(registration: PersistedDeviceRegistration) {
    await this.lastSyncedRegistrationStore.set(registration);
  }

  async getLastHandledResponseId() {
    return AsyncStorage.getItem(LAST_HANDLED_RESPONSE_ID_KEY);
  }

  async saveLastHandledResponseId(responseId: string) {
    await AsyncStorage.setItem(LAST_HANDLED_RESPONSE_ID_KEY, responseId);
  }

  async saveLastNotificationEvent(event: NotificationEvent) {
    await this.lastNotificationEventStore.set(event);
  }
}
