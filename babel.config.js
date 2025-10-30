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
      ["module:react-native-dotenv", {
        "envName": "APP_ENV",
        "moduleName": "@env",
        "path": ".env",
        "safe": false,
        "allowUndefined": true,
        "verbose": false
      }],
      'react-native-reanimated/plugin', // MUST be last
    ],
  };
};