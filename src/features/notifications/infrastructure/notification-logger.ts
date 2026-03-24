import * as Sentry from '@sentry/react-native';

import type { NotificationLogger } from '@/features/notifications/domain/ports';

function addBreadcrumb(message: string, level: 'debug' | 'info' | 'warning' | 'error', context?: Record<string, unknown>) {
  if (!Sentry.getClient()) {
    return;
  }

  Sentry.addBreadcrumb({
    category: 'notifications',
    message,
    level,
    data: context,
  });
}

function asError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown notifications error');
}

export class SentryNotificationLogger implements NotificationLogger {
  debug(message: string, context?: Record<string, unknown>) {
    addBreadcrumb(message, 'debug', context);
  }

  info(message: string, context?: Record<string, unknown>) {
    addBreadcrumb(message, 'info', context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    addBreadcrumb(message, 'warning', context);
  }

  error(message: string, error: unknown, context?: Record<string, unknown>) {
    addBreadcrumb(message, 'error', context);

    if (!Sentry.getClient()) {
      return;
    }

    Sentry.withScope(scope => {
      scope.setTag('feature', 'notifications');
      if (context) {
        scope.setContext('notifications', context);
      }
      Sentry.captureException(asError(error));
    });
  }
}
