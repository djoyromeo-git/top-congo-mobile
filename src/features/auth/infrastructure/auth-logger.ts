import * as Sentry from '@sentry/react-native';

import type { AuthLogger } from '@/features/auth/domain/ports';

export class SentryAuthLogger implements AuthLogger {
  debug(message: string, context?: Record<string, unknown>) {
    this.addBreadcrumb(message, 'debug', context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.addBreadcrumb(message, 'info', context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.addBreadcrumb(message, 'warning', context);
  }

  error(message: string, error: unknown, context?: Record<string, unknown>) {
    this.addBreadcrumb(message, 'error', context);

    if (!Sentry.getClient()) {
      return;
    }

    Sentry.withScope(scope => {
      scope.setTag('feature', 'auth');
      if (context) {
        scope.setContext('auth', context);
      }
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  }

  private addBreadcrumb(message: string, level: 'debug' | 'info' | 'warning' | 'error', data?: Record<string, unknown>) {
    if (!Sentry.getClient()) {
      return;
    }

    Sentry.addBreadcrumb({
      category: 'auth',
      message,
      level,
      data,
    });
  }
}
