import { API_CONFIG } from '../config/api';
import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = API_CONFIG.BASE_URL;
const CACHE_KEY = 'products_cache';
const CACHE_TIMESTAMP_KEY = 'products_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SHOP_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Fonction pour vérifier la connectivité avec fallback
const checkConnectivity = async () => {
  try {
    await apiClient.get('/health');
    return API_BASE_URL;
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
    const products = await apiClient.get('/debug/products');
    console.log(`📦 ${products.length} produits récupérés`);
    
    // Limiter le nombre de produits pour éviter OOM
    const limitedProducts = products.slice(0, 50);
    
    // Pour chaque produit, récupérer les infos de la boutique
    const productsWithShops = await Promise.all(
      limitedProducts.map(async (product) => {
        let shop = null;
        if (product.shopId) {
          try {
            shop = await apiClient.get(`/shops/${product.shopId}`);
          } catch (error) {
            // Ignorer l'erreur et continuer
          }
        }
        
        return {
          id: product._id,
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock ?? 0,
          images: (product.images || []).slice(0, 3),
          shop: shop ? {
            _id: shop._id,
            id: shop._id,
            username: shop.name,
            name: shop.name,
            phone: shop.phone,
            whatsapp: shop.whatsapp,
            email: shop.email,
            address: shop.address,
            profileImage: shop.profileImage || null,
            mainImage: shop.mainImage || null,
            coverImage: shop.mainImage || shop.coverImage || null,
            category: shop.category || '',
            isApproved: shop.isApproved || false,
            bankAccounts: shop.bankAccounts || [],
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

export const fetchProductsByShop = async (shopId, page = 1, limit = 20) => {
  const cacheKey = `shop_products_${shopId}_${page}`;
  const cacheTimestampKey = `shop_products_ts_${shopId}_${page}`;
  try {
    // Check cache
    const [cachedData, cachedTs] = await Promise.all([
      Platform.OS === 'web' ? localStorage.getItem(cacheKey) : AsyncStorage.getItem(cacheKey),
      Platform.OS === 'web' ? localStorage.getItem(cacheTimestampKey) : AsyncStorage.getItem(cacheTimestampKey),
    ]);
    if (cachedData && cachedTs && Date.now() - parseInt(cachedTs) < SHOP_CACHE_DURATION) {
      return JSON.parse(cachedData);
    }

    const activeApiUrl = await checkConnectivity();
    if (!activeApiUrl) return cachedData ? JSON.parse(cachedData) : [];

    // Try dedicated endpoint first, fallback to filter from all
    let products = [];
    try {
      products = await apiClient.get(`/products/shop/${shopId}?page=${page}&limit=${limit}`);
    } catch {
      const all = await apiClient.get('/debug/products');
      products = all
        .filter(p => p.shopId === shopId || p.shop?._id === shopId)
        .slice((page - 1) * limit, page * limit);
    }

    const result = products.map(p => ({
      id: p._id, _id: p._id,
      name: p.name, description: p.description,
      price: p.price, category: p.category,
      stock: p.stock ?? 0,
      images: (p.images || []).slice(0, 3),
      shop: p.shop || null,
    }));

    const serialized = JSON.stringify(result);
    const ts = Date.now().toString();
    if (Platform.OS === 'web') {
      localStorage.setItem(cacheKey, serialized);
      localStorage.setItem(cacheTimestampKey, ts);
    } else {
      await AsyncStorage.setItem(cacheKey, serialized);
      await AsyncStorage.setItem(cacheTimestampKey, ts);
    }
    return result;
  } catch (error) {
    console.error('fetchProductsByShop error:', error);
    return [];
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