import AsyncStorage from '@react-native-async-storage/async-storage';

// Script pour nettoyer les boutiques locales fantômes
const clearLocalShops = async () => {
  try {
    await AsyncStorage.removeItem('localShops');
    console.log('✅ Boutiques locales supprimées');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

clearLocalShops();