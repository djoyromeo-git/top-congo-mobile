import type { ExpoConfig } from 'expo/config';

const baseConfig = require('./app.json').expo as ExpoConfig;

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_URL_SCHEME?.trim() ?? '';
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';

function getCleartextExceptionDomain() {
  if (!apiUrl.startsWith('http://')) {
    return null;
  }

  try {
    return new URL(apiUrl).hostname;
  } catch {
    return null;
  }
}

const cleartextExceptionDomain = getCleartextExceptionDomain();

const plugins = (baseConfig.plugins ?? []).filter(plugin => {
  if (Array.isArray(plugin)) {
    return plugin[0] !== '@react-native-google-signin/google-signin' && plugin[0] !== 'expo-build-properties';
  }

  return plugin !== '@react-native-google-signin/google-signin' && plugin !== 'expo-build-properties';
});

plugins.push([
  'expo-build-properties',
  {
    android: {
      usesCleartextTraffic: Boolean(cleartextExceptionDomain),
    },
  },
]);

if (googleIosUrlScheme) {
  plugins.push([
    '@react-native-google-signin/google-signin',
    {
      iosUrlScheme: googleIosUrlScheme,
    },
  ]);
}

export default {
  ...baseConfig,
  ios: {
    ...baseConfig.ios,
    usesAppleSignIn: true,
    infoPlist: {
      ...baseConfig.ios?.infoPlist,
      ...(cleartextExceptionDomain
        ? {
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: false,
              NSExceptionDomains: {
                [cleartextExceptionDomain]: {
                  NSExceptionAllowsInsecureHTTPLoads: true,
                  NSIncludesSubdomains: true,
                },
              },
            },
          }
        : {}),
    },
  },
  plugins,
} satisfies ExpoConfig;
