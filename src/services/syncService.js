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
  // Synchroniser les boutiques locales vers MongoDB
  syncShops: async () => {
    try {
      console.log('🔄 Début synchronisation boutiques...');
      
      // Vérifier la connectivité
      const activeApiUrl = await checkConnectivity();
      if (!activeApiUrl) {
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
      console.log('🔄 Début synchronisation produits...');
      
      // Vérifier la connectivité
      const activeApiUrl = await checkConnectivity();
      if (!activeApiUrl) {
        console.log('❌ Pas de connexion serveur pour sync produits');
        return 0;
      }
      
      const keys = await AsyncStorage.getAllKeys();
      const productKeys = keys.filter(key => 
        key.startsWith('products_') && 
        !key.includes('cache') && 
        !key.includes('timestamp')
      );
      let syncedCount = 0;
      
      console.log(`📊 ${productKeys.length} clés produits trouvées`);

      for (const key of productKeys) {
        const shopId = key.replace('products_', '');
        
        // Vérifier que shopId est un ObjectId valide
        if (!shopId || shopId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(shopId)) {
          console.log(`⚠️ ShopId invalide ignoré: ${shopId}`);
          continue;
        }
        
        const localProducts = await AsyncStorage.getItem(key);
        
        if (localProducts) {
          let products;
          try {
            products = JSON.parse(localProducts);
            if (!Array.isArray(products)) {
              console.log(`⚠️ Données invalides pour ${shopId}, ignoré`);
              continue;
            }
          } catch (error) {
            console.log(`❌ Erreur parsing JSON pour ${shopId}:`, error);
            continue;
          }
          
          console.log(`📦 ${products.length} produits à synchroniser pour boutique ${shopId}`);
          
          for (const product of products) {
            try {
              // S'assurer que images est un tableau
              const imageArray = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
              
              // Traiter les images locales avant synchronisation
              const processedImages = await imageService.processImages(imageArray);
              console.log(`Traitement ${imageArray.length} images pour ${product.name}`);
              
              await productAPI.create({
                name: product.name,
                price: product.price,
                images: processedImages,
                shopId: shopId
              });
              console.log(`✅ Produit ${product.name} syncé avec ${processedImages.length} images`);
              syncedCount++;
            } catch (error) {
              console.log(`❌ Échec sync produit ${product.name}:`, error);
            }
          }
          
          // Vider les produits locaux après sync
          await AsyncStorage.removeItem(key);
          console.log(`🗑️ Produits locaux supprimés pour ${shopId}`);
        }
      }
      
      // Vider le cache des produits pour forcer le rechargement
      if (syncedCount > 0) {
        await clearProductsCache();
        console.log('🔄 Cache produits vidé après synchronisation');
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
    
    // Vider le cache pour s'assurer que les nouvelles données sont chargées
    await clearProductsCache();
    
    console.log(`🎉 Synchronisation terminée: ${shopsCount} boutiques, ${productsCount} produits`);
    return {
      shops: shopsCount,
      products: productsCount
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
