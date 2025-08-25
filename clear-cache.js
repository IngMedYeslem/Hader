// Script pour vider complètement le cache local
const { Platform } = require('react-native');

const clearAllCache = async () => {
  try {
    if (Platform.OS === 'web') {
      // Vider localStorage
      if (typeof localStorage !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('products') || key.includes('shops') || key.includes('cache')) {
            localStorage.removeItem(key);
            console.log(`Supprimé: ${key}`);
          }
        });
      }
    } else {
      // Vider AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.includes('products') || 
        key.includes('shops') || 
        key.includes('cache') ||
        key.startsWith('products_')
      );
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Supprimé ${cacheKeys.length} clés de cache:`, cacheKeys);
      }
    }
    
    console.log('✅ Cache vidé avec succès');
  } catch (error) {
    console.error('❌ Erreur vidage cache:', error);
  }
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAllCache };
}

// Exécuter si appelé directement
if (require.main === module) {
  clearAllCache();
}