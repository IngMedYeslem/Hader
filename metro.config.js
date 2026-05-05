const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

config.resolver.sourceExts = [
  ...config.resolver.sourceExts.filter(ext => ext !== 'mjs'),
  'mjs',
];

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
