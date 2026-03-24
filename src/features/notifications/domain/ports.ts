import type { DeviceRegistration, NotificationEvent, PersistedDeviceRegistration } from './models';

export interface Subscription {
  remove(): void;
}

export interface NotificationInstallationStore {
  getDeviceUuid(): Promise<string | null>;
  saveDeviceUuid(deviceUuid: string): Promise<void>;
  getLastSyncedRegistration(): Promise<PersistedDeviceRegistration | null>;
  saveLastSyncedRegistration(registration: PersistedDeviceRegistration): Promise<void>;
  getLastHandledResponseId(): Promise<string | null>;
  saveLastHandledResponseId(responseId: string): Promise<void>;
  saveLastNotificationEvent(event: NotificationEvent): Promise<void>;
}

export interface PushRegistrationGateway {
  upsertDeviceRegistration(registration: DeviceRegistration): Promise<void>;
}

export interface NotificationRuntime {
  configureForegroundPresentation(): void;
  ensurePermissionsAsync(): Promise<boolean>;
  getDevicePushTokenAsync(): Promise<Omit<DeviceRegistration, 'deviceUuid'> | null>;
  addPushTokenRefreshListener(
    listener: (registration: Omit<DeviceRegistration, 'deviceUuid'>) => Promise<void> | void
  ): Subscription;
  addForegroundNotificationListener(listener: (event: NotificationEvent) => Promise<void> | void): Subscription;
  addNotificationResponseListener(listener: (event: NotificationEvent) => Promise<void> | void): Subscription;
  getLastNotificationResponseAsync(): Promise<NotificationEvent | null>;
  clearLastNotificationResponse(): void;
  ensureBackgroundTaskRegisteredAsync(): Promise<void>;
}

export interface NotificationNavigator {
  open(event: NotificationEvent): Promise<void>;
}

export interface NotificationLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error: unknown, context?: Record<string, unknown>): void;
}
