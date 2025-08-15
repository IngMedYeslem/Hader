import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = API_CONFIG.BASE_URL;
const CACHE_KEY = 'products_cache';
const CACHE_TIMESTAMP_KEY = 'products_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour vérifier la connectivité avec fallback
const checkConnectivity = async () => {
  try {
    // Essayer l'URL principale
    const response = await fetch(`${API_BASE_URL}/health`, { timeout: 3000 });
    if (response.ok) return API_BASE_URL;
    
    // Essayer l'URL de fallback
    const fallbackResponse = await fetch(`${API_CONFIG.FALLBACK_URL}/health`, { timeout: 3000 });
    if (fallbackResponse.ok) return API_CONFIG.FALLBACK_URL;
    
    return null;
  } catch (error) {
    console.log('Aucune connectivité serveur:', error.message);
    return null;
  }
};

// Fonction pour gérer le cache
const getCachedProducts = async () => {
  try {
    const cachedData = Platform.OS === 'web' 
      ? localStorage.getItem(CACHE_KEY)
      : await AsyncStorage.getItem(CACHE_KEY);
    
    const cachedTimestamp = Platform.OS === 'web'
      ? localStorage.getItem(CACHE_TIMESTAMP_KEY)
      : await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();
      
      if (now - timestamp < CACHE_DURATION) {
        console.log('📱 Utilisation du cache produits');
        return JSON.parse(cachedData);
      }
    }
    
    return null;
  } catch (error) {
    console.log('Erreur lecture cache:', error);
    return null;
  }
};

const setCachedProducts = async (products) => {
  try {
    const dataToCache = JSON.stringify(products);
    const timestamp = Date.now().toString();
    
    if (Platform.OS === 'web') {
      localStorage.setItem(CACHE_KEY, dataToCache);
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp);
    } else {
      await AsyncStorage.setItem(CACHE_KEY, dataToCache);
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp);
    }
    
    console.log('💾 Produits mis en cache');
  } catch (error) {
    console.log('Erreur sauvegarde cache:', error);
  }
};

export const fetchProductsWithShops = async (forceRefresh = false) => {
  try {
    // Vérifier le cache d'abord si pas de refresh forcé
    if (!forceRefresh) {
      const cachedProducts = await getCachedProducts();
      if (cachedProducts) {
        return cachedProducts;
      }
    }
    
    // Vérifier la connectivité
    const activeApiUrl = await checkConnectivity();
    if (!activeApiUrl) {
      console.log('❌ Aucune connectivité - utilisation cache si disponible');
      const cachedProducts = await getCachedProducts();
      return cachedProducts || [];
    }
    
    console.log('🌐 Récupération produits depuis:', activeApiUrl);
    const productsResponse = await fetch(`${activeApiUrl}/debug/products`);
    
    if (!productsResponse.ok) throw new Error('Erreur récupération produits');
    
    const products = await productsResponse.json();
    console.log(`📦 ${products.length} produits récupérés`);
    
    // Limiter le nombre de produits pour éviter OOM
    const limitedProducts = products.slice(0, 50);
    
    // Pour chaque produit, récupérer les infos de la boutique
    const productsWithShops = await Promise.all(
      limitedProducts.map(async (product) => {
        let shop = null;
        if (product.shopId) {
          try {
            const shopResponse = await fetch(`${activeApiUrl}/shops/${product.shopId}`);
            if (shopResponse.ok) {
              shop = await shopResponse.json();
            }
          } catch (error) {
            // Ignorer l'erreur et continuer
          }
        }
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          images: (product.images || []).slice(0, 3), // Limiter à 3 images max
          videos: (product.videos || []).slice(0, 1), // Limiter à 1 vidéo max
          shop: shop ? {
            id: shop._id,
            username: shop.name,
            phone: shop.phone,
            whatsapp: shop.whatsapp,
            email: shop.email,
            address: shop.address,
            profileImage: null
          } : null
        };
      })
    );
    
    // Mettre en cache les résultats
    await setCachedProducts(productsWithShops);
    
    return productsWithShops;
  } catch (error) {
    console.error('Erreur API:', error);
    // En cas d'erreur, essayer de retourner le cache
    const cachedProducts = await getCachedProducts();
    return cachedProducts || [];
  }
};

export const checkServerHealth = async () => {
  const activeApiUrl = await checkConnectivity();
  return activeApiUrl !== null;
};

// Fonction pour vider le cache
export const clearProductsCache = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } else {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
    }
    console.log('🗑️ Cache produits vidé');
  } catch (error) {
    console.log('Erreur vidage cache:', error);
  }
};