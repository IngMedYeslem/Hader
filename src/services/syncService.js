import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopAPI, productAPI } from './api';

import { Platform } from 'react-native';

// URL dynamique selon la plateforme
const API_BASE = __DEV__ && Platform.OS !== 'web' 
  ? 'http://192.168.100.121:3000/api'  // IP locale pour smartphone
  : 'http://localhost:3000/api';

// Vérifier la connectivité réseau
const checkConnectivity = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.log('Pas de connexion serveur:', error.message);
    return false;
  }
};

export const syncService = {
  // Synchroniser les boutiques locales vers MongoDB
  syncShops: async () => {
    try {
      console.log('🔄 Début synchronisation boutiques...');
      
      // Vérifier la connectivité
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        console.log('❌ Pas de connexion serveur');
        return 0;
      }

      const localShops = await AsyncStorage.getItem('localShops');
      console.log('📱 Boutiques locales:', localShops);
      
      if (!localShops) {
        console.log('✅ Aucune boutique locale à synchroniser');
        return 0;
      }

      const shops = JSON.parse(localShops);
      console.log(`📊 ${shops.length} boutiques à synchroniser`);
      
      const syncedShops = [];

      for (const shop of shops) {
        try {
          console.log(`🔄 Synchronisation de ${shop.name}...`);
          const mongoShop = await shopAPI.register(shop.name, shop.email, shop.password);
          
          if (!mongoShop.error) {
            syncedShops.push(shop);
            console.log(`✅ Boutique ${shop.name} synchronisée`);
          } else {
            console.log(`⚠️ Erreur sync ${shop.name}:`, mongoShop.error);
          }
        } catch (error) {
          console.log(`❌ Échec sync boutique ${shop.name}:`, error.message);
        }
      }

      // Supprimer les boutiques synchronisées du stockage local
      if (syncedShops.length > 0) {
        const remainingShops = shops.filter(shop => !syncedShops.includes(shop));
        await AsyncStorage.setItem('localShops', JSON.stringify(remainingShops));
        console.log(`🗑️ ${syncedShops.length} boutiques supprimées du stockage local`);
      }

      console.log(`✅ Synchronisation terminée: ${syncedShops.length} boutiques`);
      return syncedShops.length;
    } catch (error) {
      console.error('❌ Erreur sync boutiques:', error);
      return 0;
    }
  },

  // Synchroniser les produits locaux vers MongoDB
  syncProducts: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const productKeys = keys.filter(key => key.startsWith('products_'));
      let syncedCount = 0;

      for (const key of productKeys) {
        const shopId = key.replace('products_', '');
        const localProducts = await AsyncStorage.getItem(key);
        
        if (localProducts) {
          const products = JSON.parse(localProducts);
          
          for (const product of products) {
            try {
              await productAPI.create({
                name: product.name,
                price: product.price,
                images: product.images,
                shopId: shopId
              });
              syncedCount++;
            } catch (error) {
              console.log(`Échec sync produit ${product.name}`);
            }
          }
          
          // Vider les produits locaux après sync
          await AsyncStorage.removeItem(key);
        }
      }

      return syncedCount;
    } catch (error) {
      console.error('Erreur sync produits:', error);
      return 0;
    }
  },

  // Synchronisation complète
  syncAll: async () => {
    console.log('🚀 Début synchronisation complète...');
    const shopsCount = await syncService.syncShops();
    const productsCount = await syncService.syncProducts();
    
    console.log(`🎉 Synchronisation terminée: ${shopsCount} boutiques, ${productsCount} produits`);
    return {
      shops: shopsCount,
      products: productsCount
    };
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
