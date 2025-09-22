module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      ["module-resolver", {
        "alias": {
          "@src": "./src",
          "@app": "./app",
          "@assets": "./assets"
        },
        "extensions": [".tsx", ".ts", ".js", ".json"]
      }],
      'react-native-reanimated/plugin', // MUST be last
    ],
  };
};