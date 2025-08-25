import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopAPI, productAPI } from './api';
import { imageService } from './imageService';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';
import { clearProductsCache } from './apiService';

// Vérifier la connectivité réseau avec fallback
const checkConnectivity = async () => {
  try {
    // Essayer l'URL principale
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 3000
    });
    if (response.ok) return API_CONFIG.BASE_URL;
    
    // Essayer l'URL de fallback
    const fallbackResponse = await fetch(`${API_CONFIG.FALLBACK_URL}/health`, {
      method: 'GET',
      timeout: 3000
    });
    if (fallbackResponse.ok) return API_CONFIG.FALLBACK_URL;
    
    return null;
  } catch (error) {
    console.log('Pas de connexion serveur:', error.message);
    return null;
  }
};

export const syncService = {
  // Synchroniser les boutiques locales vers MongoDB (désactivé)
  syncShops: async () => {
    console.log('⚠️ Synchronisation boutiques désactivée - serveur requis');
    return 0;
  },

  // Synchroniser les produits locaux vers MongoDB (désactivé)
  syncProducts: async () => {
    console.log('⚠️ Synchronisation produits désactivée - serveur requis');
    return 0;
  },

  // Synchronisation complète (désactivée)
  syncAll: async () => {
    console.log('⚠️ Synchronisation désactivée - serveur requis');
    return {
      shops: 0,
      products: 0
    };
  },
  
  // Forcer la synchronisation des produits depuis le serveur
  forceRefreshProducts: async () => {
    try {
      console.log('🔄 Forçage actualisation produits...');
      await clearProductsCache();
      
      // Importer dynamiquement pour éviter les dépendances circulaires
      const { fetchProductsWithShops } = await import('./apiService');
      const products = await fetchProductsWithShops(true);
      
      console.log(`✅ ${products.length} produits actualisés`);
      return products;
    } catch (error) {
      console.error('Erreur actualisation produits:', error);
      return [];
    }
  }
};

// Fonction utilitaire pour marquer une boutique comme à synchroniser
export const markShopForSync = async (shop) => {
  try {
    const localShops = await AsyncStorage.getItem('localShops');
    const shops = localShops ? JSON.parse(localShops) : [];
    
    // Ajouter la boutique si elle n'existe pas déjà
    const exists = shops.find(s => s.email === shop.email);
    if (!exists) {
      shops.push(shop);
      await AsyncStorage.setItem('localShops', JSON.stringify(shops));
      console.log('📝 Boutique marquée pour synchronisation:', shop.name);
    }
  } catch (error) {
    console.error('Erreur marquage boutique:', error);
  }
};
