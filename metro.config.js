// Enable .wasm asset support for Expo Metro bundler
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow importing .wasm as an asset URL string, required by expo-sqlite web worker
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;
