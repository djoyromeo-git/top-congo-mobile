const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID?.trim() ?? '';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID?.trim() ?? '';

export const AUTH_SESSION_STORAGE_KEY = 'auth.session.v1';
export const GOOGLE_AUTH_SCOPES = ['openid', 'profile', 'email'];

export function getGoogleAuthConfiguration() {
  return {
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
  };
}
