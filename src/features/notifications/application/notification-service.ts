import * as Crypto from 'expo-crypto';

import type { DeviceRegistration, NotificationEvent, PersistedDeviceRegistration } from '@/features/notifications/domain/models';
import type {
  NotificationInstallationStore,
  NotificationLogger,
  NotificationNavigator,
  NotificationRuntime,
  PushRegistrationGateway,
  Subscription,
} from '@/features/notifications/domain/ports';

function areRegistrationsEqual(a: DeviceRegistration, b: DeviceRegistration | PersistedDeviceRegistration) {
  return a.deviceUuid === b.deviceUuid && a.platform === b.platform && a.pushToken === b.pushToken;
}

export class NotificationService {
  private started = false;
  private syncQueue: Promise<void> = Promise.resolve();
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly runtime: NotificationRuntime,
    private readonly store: NotificationInstallationStore,
    private readonly gateway: PushRegistrationGateway,
    private readonly navigator: NotificationNavigator,
    private readonly logger: NotificationLogger
  ) {}

  async start() {
    if (this.started) {
      return;
    }

    this.started = true;
    this.runtime.configureForegroundPresentation();

    try {
      await this.runtime.ensureBackgroundTaskRegisteredAsync();
    } catch (error) {
      this.logger.error('notifications.background_task_registration_failed', error);
    }

    this.subscriptions.push(
      this.runtime.addForegroundNotificationListener(async event => {
        try {
          await this.handleForegroundNotification(event);
        } catch (error) {
          this.logger.error('notifications.foreground_event_failed', error, {
            id: event.id,
          });
        }
      })
    );

    this.subscriptions.push(
      this.runtime.addNotificationResponseListener(async event => {
        try {
          await this.handleNotificationResponse(event);
        } catch (error) {
          this.logger.error('notifications.response_handling_failed', error, {
            id: event.id,
          });
        }
      })
    );

    this.subscriptions.push(
      this.runtime.addPushTokenRefreshListener(async registration => {
        this.logger.info('notifications.push_token_refreshed', {
          platform: registration.platform,
        });
        try {
          await this.syncRegistrationAsync(registration, 'token-refresh');
        } catch {
          // The sync error is already logged and should not surface as an unhandled listener rejection.
        }
      })
    );

    const permissionsGranted = await this.runtime.ensurePermissionsAsync();
    if (!permissionsGranted) {
      this.logger.warn('notifications.permission_denied');
    } else {
      const currentRegistration = await this.runtime.getDevicePushTokenAsync();
      if (currentRegistration) {
        try {
          await this.syncRegistrationAsync(currentRegistration, 'startup');
        } catch {
          // The sync error is already logged and should not block notification response handling.
        }
      } else {
        this.logger.warn('notifications.push_token_unavailable');
      }
    }

    const lastResponse = await this.runtime.getLastNotificationResponseAsync();
    if (lastResponse) {
      try {
        await this.handleNotificationResponse(lastResponse);
      } catch (error) {
        this.logger.error('notifications.quit_response_handling_failed', error, {
          id: lastResponse.id,
        });
      }
    }
  }

  stop() {
    for (const subscription of this.subscriptions.splice(0)) {
      subscription.remove();
    }

    this.started = false;
  }

  private async handleForegroundNotification(event: NotificationEvent) {
    this.logger.info('notifications.received_foreground', {
      id: event.id,
      actionIdentifier: event.actionIdentifier,
    });
    await this.store.saveLastNotificationEvent(event);
  }

  private async handleNotificationResponse(event: NotificationEvent) {
    const lastHandledResponseId = await this.store.getLastHandledResponseId();
    if (lastHandledResponseId === event.id) {
      return;
    }

    this.logger.info('notifications.response_received', {
      id: event.id,
      actionIdentifier: event.actionIdentifier,
      lifecycle: event.lifecycle,
    });

    await this.store.saveLastNotificationEvent(event);
    await this.navigator.open(event);
    await this.store.saveLastHandledResponseId(event.id);
    this.runtime.clearLastNotificationResponse();
  }

  private async syncRegistrationAsync(
    registrationWithoutDeviceUuid: Omit<DeviceRegistration, 'deviceUuid'>,
    reason: string
  ) {
    this.syncQueue = this.syncQueue
      .catch(() => undefined)
      .then(() => this.performSyncRegistrationAsync(registrationWithoutDeviceUuid, reason));

    await this.syncQueue;
  }

  private async performSyncRegistrationAsync(
    registrationWithoutDeviceUuid: Omit<DeviceRegistration, 'deviceUuid'>,
    reason: string
  ) {
    const deviceUuid = await this.ensureDeviceUuidAsync();
    const registration: DeviceRegistration = {
      ...registrationWithoutDeviceUuid,
      deviceUuid,
    };

    const lastSyncedRegistration = await this.store.getLastSyncedRegistration();
    if (lastSyncedRegistration && areRegistrationsEqual(registration, lastSyncedRegistration)) {
      this.logger.debug('notifications.registration_skipped', {
        reason,
        platform: registration.platform,
      });
      return;
    }

    try {
      await this.gateway.upsertDeviceRegistration(registration);
      await this.store.saveLastSyncedRegistration({
        ...registration,
        syncedAt: new Date().toISOString(),
      });
      this.logger.info('notifications.registration_synced', {
        reason,
        platform: registration.platform,
      });
    } catch (error) {
      this.logger.error('notifications.registration_sync_failed', error, {
        reason,
        platform: registration.platform,
      });
      throw error;
    }
  }

  private async ensureDeviceUuidAsync() {
    const existing = await this.store.getDeviceUuid();
    if (existing) {
      return existing;
    }

    const deviceUuid = Crypto.randomUUID();
    await this.store.saveDeviceUuid(deviceUuid);
    return deviceUuid;
  }
}
