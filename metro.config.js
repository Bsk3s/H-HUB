const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add polyfills for React Native (leave stream/buffer if needed; avoid crypto alias)
config.resolver.alias = {
  ...config.resolver.alias,
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
};

module.exports = config;