import { type Href, type Router } from 'expo-router';
import * as Linking from 'expo-linking';

import type { NotificationEvent } from '@/features/notifications/domain/models';
import type { NotificationNavigator } from '@/features/notifications/domain/ports';

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function buildRouteFromPayload(data: Record<string, unknown>) {
  const url = asNonEmptyString(data.url);
  if (url) {
    return url;
  }

  const route = asNonEmptyString(data.route);
  if (!route) {
    return null;
  }

  const params = asRecord(data.params);
  if (!params) {
    return route;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `${route}?${query}` : route;
}

function isExternalUrl(value: string) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

export class ExpoNotificationNavigator implements NotificationNavigator {
  constructor(private readonly router: Router) {}

  async open(event: NotificationEvent) {
    const destination = buildRouteFromPayload(event.data);
    if (!destination) {
      return;
    }

    if (isExternalUrl(destination)) {
      await Linking.openURL(destination);
      return;
    }

    this.router.push(destination as Href);
  }
}
