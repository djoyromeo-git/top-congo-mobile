export type NotificationPlatform = 'android' | 'ios';

export type NotificationLifecycle = 'foreground' | 'background' | 'quit';

export interface DeviceRegistration {
  deviceUuid: string;
  pushToken: string;
  platform: NotificationPlatform;
}

export interface PersistedDeviceRegistration extends DeviceRegistration {
  syncedAt: string;
}

export interface NotificationEvent {
  id: string;
  actionIdentifier?: string | null;
  lifecycle: NotificationLifecycle;
  title: string | null;
  body: string | null;
  data: Record<string, unknown>;
  receivedAt: string;
}
