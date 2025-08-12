const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure the port
config.server = {
  port: 8082,
};

module.exports = config;