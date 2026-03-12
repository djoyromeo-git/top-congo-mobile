import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import {
  NOTIFICATIONS_ANDROID_CHANNEL_DESCRIPTION,
  NOTIFICATIONS_ANDROID_CHANNEL_ID,
  NOTIFICATIONS_ANDROID_CHANNEL_NAME,
} from '@/features/notifications/config';
import type { DeviceRegistration, NotificationEvent, NotificationPlatform } from '@/features/notifications/domain/models';
import type { NotificationRuntime } from '@/features/notifications/domain/ports';
import { BACKGROUND_NOTIFICATION_TASK_NAME } from '@/features/notifications/infrastructure/background-notification-task';

function asNativePlatform(platform: string): NotificationPlatform | null {
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }

  return null;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function createNotificationEvent(
  notification: Notifications.Notification,
  lifecycle: NotificationEvent['lifecycle'],
  actionIdentifier?: string | null
): NotificationEvent {
  return {
    id: notification.request.identifier,
    actionIdentifier: actionIdentifier ?? null,
    lifecycle,
    title: notification.request.content.title ?? null,
    body: notification.request.content.body ?? null,
    data: asRecord(notification.request.content.data),
    receivedAt: new Date().toISOString(),
  };
}

export class ExpoNotificationRuntime implements NotificationRuntime {
  private foregroundPresentationConfigured = false;

  configureForegroundPresentation() {
    if (this.foregroundPresentationConfigured || Platform.OS === 'web') {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    this.foregroundPresentationConfigured = true;
  }

  async ensurePermissionsAsync() {
    if (Platform.OS === 'web') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATIONS_ANDROID_CHANNEL_ID, {
        name: NOTIFICATIONS_ANDROID_CHANNEL_NAME,
        description: NOTIFICATIONS_ANDROID_CHANNEL_DESCRIPTION,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#B10018',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.granted) {
      return true;
    }

    if (permissions.canAskAgain === false) {
      return false;
    }

    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return requested.granted;
  }

  async getDevicePushTokenAsync(): Promise<Omit<DeviceRegistration, 'deviceUuid'> | null> {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return null;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    const platform = asNativePlatform(token.type);

    if (!platform || typeof token.data !== 'string' || token.data.trim().length === 0) {
      return null;
    }

    return {
      platform,
      pushToken: token.data.trim(),
    };
  }

  addPushTokenRefreshListener(
    listener: (registration: Omit<DeviceRegistration, 'deviceUuid'>) => Promise<void> | void
  ) {
    return Notifications.addPushTokenListener(token => {
      const platform = asNativePlatform(token.type);
      if (!platform || typeof token.data !== 'string' || token.data.trim().length === 0) {
        return;
      }

      void listener({
        platform,
        pushToken: token.data.trim(),
      });
    });
  }

  addForegroundNotificationListener(listener: (event: NotificationEvent) => Promise<void> | void) {
    return Notifications.addNotificationReceivedListener(notification => {
      void listener(createNotificationEvent(notification, 'foreground'));
    });
  }

  addNotificationResponseListener(listener: (event: NotificationEvent) => Promise<void> | void) {
    return Notifications.addNotificationResponseReceivedListener(response => {
      void listener(
        createNotificationEvent(response.notification, 'foreground', response.actionIdentifier ?? null)
      );
    });
  }

  async getLastNotificationResponseAsync() {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) {
      return null;
    }

    return createNotificationEvent(response.notification, 'quit', response.actionIdentifier ?? null);
  }

  clearLastNotificationResponse() {
    Notifications.clearLastNotificationResponse();
  }

  async ensureBackgroundTaskRegisteredAsync() {
    if (Platform.OS === 'web') {
      return;
    }

    const isTaskManagerAvailable = await TaskManager.isAvailableAsync();
    if (!isTaskManagerAvailable) {
      return;
    }

    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK_NAME);
    if (!isTaskRegistered) {
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK_NAME);
    }
  }
}
