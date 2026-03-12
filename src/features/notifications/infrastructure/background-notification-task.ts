import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { AsyncStorageNotificationInstallationStore } from '@/features/notifications/infrastructure/async-storage-notification-installation-store';

const BACKGROUND_NOTIFICATION_TASK_NAME = 'topcongo-background-notification-task';

const store = new AsyncStorageNotificationInstallationStore();

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getContentData(source: Record<string, unknown>) {
  const data = source.data;
  return asRecord(data);
}

function getResponseData(source: Notifications.NotificationResponse) {
  return asRecord(source.notification.request.content.data);
}

function createEventFromTaskPayload(payload: Notifications.NotificationTaskPayload) {
  const receivedAt = new Date().toISOString();

  if ('actionIdentifier' in payload) {
    return {
      id: payload.notification.request.identifier,
      actionIdentifier: payload.actionIdentifier,
      lifecycle: 'background' as const,
      title: payload.notification.request.content.title ?? null,
      body: payload.notification.request.content.body ?? null,
      data: getResponseData(payload),
      receivedAt,
    };
  }

  return {
    id: String(payload.data?.messageId ?? payload.data?.['google.message_id'] ?? Date.now()),
    actionIdentifier: null,
    lifecycle: 'background' as const,
    title: typeof payload.notification?.title === 'string' ? payload.notification.title : null,
    body: typeof payload.notification?.body === 'string' ? payload.notification.body : null,
    data: getContentData(payload),
    receivedAt,
  };
}

if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK_NAME)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(BACKGROUND_NOTIFICATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      return Notifications.BackgroundNotificationTaskResult.Failed;
    }

    await store.saveLastNotificationEvent(createEventFromTaskPayload(data));
    return Notifications.BackgroundNotificationTaskResult.NoData;
  });
}

export { BACKGROUND_NOTIFICATION_TASK_NAME };
