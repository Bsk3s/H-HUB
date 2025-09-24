const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add polyfills for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: require.resolve('expo-crypto'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
};

module.exports = config;