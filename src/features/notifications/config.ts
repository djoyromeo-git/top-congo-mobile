function trimEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const DEFAULT_REGISTRATION_PATH = '/notifications/devices';

export const NOTIFICATIONS_ANDROID_CHANNEL_ID =
  trimEnv(process.env.EXPO_PUBLIC_NOTIFICATIONS_ANDROID_CHANNEL_ID) ?? 'general';
export const NOTIFICATIONS_ANDROID_CHANNEL_NAME =
  trimEnv(process.env.EXPO_PUBLIC_NOTIFICATIONS_ANDROID_CHANNEL_NAME) ?? 'General';
export const NOTIFICATIONS_ANDROID_CHANNEL_DESCRIPTION =
  trimEnv(process.env.EXPO_PUBLIC_NOTIFICATIONS_ANDROID_CHANNEL_DESCRIPTION) ?? 'Top Congo push notifications';

export function getNotificationsRegistrationUrl() {
  const directUrl = trimEnv(process.env.EXPO_PUBLIC_NOTIFICATIONS_DEVICE_REGISTRATION_URL);
  if (directUrl) {
    return directUrl;
  }

  const apiUrl = trimEnv(process.env.EXPO_PUBLIC_API_URL);
  if (!apiUrl) {
    return null;
  }

  const registrationPath =
    trimEnv(process.env.EXPO_PUBLIC_NOTIFICATIONS_DEVICE_REGISTRATION_PATH) ?? DEFAULT_REGISTRATION_PATH;

  return joinUrl(apiUrl, registrationPath);
}
