import type { ExpoConfig } from 'expo/config';

const baseConfig = require('./app.json').expo as ExpoConfig;

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_URL_SCHEME?.trim() ?? '';

const plugins = (baseConfig.plugins ?? []).filter(plugin => {
  if (Array.isArray(plugin)) {
    return plugin[0] !== '@react-native-google-signin/google-signin';
  }

  return plugin !== '@react-native-google-signin/google-signin';
});

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
  },
  plugins,
} satisfies ExpoConfig;
