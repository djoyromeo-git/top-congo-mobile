const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);
const defaultResolveRequest = config.resolver?.resolveRequest;

const isProduction = process.env.NODE_ENV === 'production';

config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform, oldMetroModuleName) => {
  if (!isProduction && moduleName === 'expo-keep-awake') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/shims/expo-keep-awake.ts'),
    };
  }

  if (defaultResolveRequest) {
    return oldMetroModuleName
      ? defaultResolveRequest(context, moduleName, platform, oldMetroModuleName)
      : defaultResolveRequest(context, moduleName, platform);
  }

  if (typeof context.resolveRequest === 'function') {
    return oldMetroModuleName
      ? context.resolveRequest(context, moduleName, platform, oldMetroModuleName)
      : context.resolveRequest(context, moduleName, platform);
  }

  throw new Error(`Unable to resolve module: ${moduleName}`);
};

module.exports = config;
