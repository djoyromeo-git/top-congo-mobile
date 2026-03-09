const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

const isProduction = process.env.NODE_ENV === 'production';

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (!isProduction && moduleName === 'expo-keep-awake') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/shims/expo-keep-awake.ts'),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
