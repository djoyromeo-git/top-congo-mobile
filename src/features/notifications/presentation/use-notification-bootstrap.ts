import { useRouter } from 'expo-router';
import React from 'react';

import { NotificationService } from '@/features/notifications/application/notification-service';
import { AsyncStorageNotificationInstallationStore } from '@/features/notifications/infrastructure/async-storage-notification-installation-store';
import { ExpoNotificationNavigator } from '@/features/notifications/infrastructure/expo-notification-navigator';
import { ExpoNotificationRuntime } from '@/features/notifications/infrastructure/expo-notification-runtime';
import { FetchPushRegistrationGateway } from '@/features/notifications/infrastructure/fetch-push-registration-gateway';
import { SentryNotificationLogger } from '@/features/notifications/infrastructure/notification-logger';

export function useNotificationBootstrap() {
  const router = useRouter();
  const serviceRef = React.useRef<NotificationService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new NotificationService(
      new ExpoNotificationRuntime(),
      new AsyncStorageNotificationInstallationStore(),
      new FetchPushRegistrationGateway(),
      new ExpoNotificationNavigator(router),
      new SentryNotificationLogger()
    );
  }

  React.useEffect(() => {
    const service = serviceRef.current;
    if (!service) {
      return;
    }

    void service.start();

    return () => {
      service.stop();
    };
  }, []);
}
