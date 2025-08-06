const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support pour les plateformes web et mobile
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;