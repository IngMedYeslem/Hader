import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utiliser l'IP locale pour les smartphones
const API_URL = __DEV__ && Platform.OS !== 'web' 
  ? 'http://192.168.100.121:3000/api'  // Remplacez par votre IP locale
  : 'http://localhost:3000/api';

// Nettoyer les boutiques locales fantômes
export const clearLocalShops = async () => {
  try {
    await AsyncStorage.removeItem('localShops');
    console.log('✅ Boutiques locales supprimées');
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
};

// Afficher boutiques en attente sans produits
export const showPendingShops = async () => {
  const localShops = await AsyncStorage.getItem('localShops');
  if (!localShops) {
    console.log('Aucune boutique en attente');
    return [];
  }
  
  const shops = JSON.parse(localShops);
  
  // Nettoyer automatiquement si des boutiques fantômes détectées
  if (shops.length > 0) {
    console.log(`⚠️ ${shops.length} boutiques fantômes détectées, nettoyage automatique...`);
    await AsyncStorage.removeItem('localShops');
    console.log('✅ Boutiques fantômes supprimées automatiquement');
    return [];
  }
  
  return shops;
};

console.log('API_URL:', API_URL);

// Construire l'URL complète pour les médias
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  
  // Si c'est déjà une URL complète, vérifier si elle utilise localhost sur mobile
  if (mediaPath.startsWith('http')) {
    if (Platform.OS !== 'web' && mediaPath.includes('localhost')) {
      return mediaPath.replace('localhost', '192.168.100.121');
    }
    return mediaPath;
  }
  
  // Construire l'URL avec la base API
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/${mediaPath}`;
};

export const shopAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/shops/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    return response.json();
  },

  register: async (shopData) => {
    const response = await fetch(`${API_URL}/shops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData),
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    return response.json();
  }
};

export const productAPI = {
  getByShop: async (shopId) => {
    const response = await fetch(`${API_URL}/products/${shopId}`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    return response.json();
  },

  create: async (product) => {
    try {
      console.log('=== Envoi produit ===');
      console.log('URL API:', API_URL);
      console.log('Produit:', { name: product.name, price: product.price, shopId: product.shopId });
      console.log('Images à envoyer:', product.images?.length || 0);
      console.log('Vidéos à envoyer:', product.videos?.length || 0);
      
      // Vérifier la taille des images et vidéos
      if (product.images) {
        product.images.forEach((img, i) => {
          console.log(`Image ${i + 1}: ${img.substring(0, 30)}... (${img.length} chars)`);
        });
      }
      if (product.videos) {
        product.videos.forEach((vid, i) => {
          console.log(`Vidéo ${i + 1}: ${vid.substring(0, 30)}... (${vid.length} chars)`);
        });
      }
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      
      console.log('Réponse status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('=== Produit créé ===');
      console.log('ID:', result._id);
      console.log('Images sauvegardées:', result.images?.length || 0);
      console.log('Vidéos sauvegardées:', result.videos?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      throw error;
    }
  },

  uploadImage: async (imageData) => {
    const formData = new FormData();
    const blob = await fetch(imageData).then(r => r.blob());
    formData.append('image', blob, 'image.jpg');
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  uploadVideo: async (videoData) => {
    const formData = new FormData();
    const blob = await fetch(videoData).then(r => r.blob());
    formData.append('video', blob, 'video.mp4');
    
    const response = await fetch(`${API_URL}/upload-video`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  deleteMedia: async (productId, mediaType, mediaIndex) => {
    const response = await fetch(`${API_URL}/products/${productId}/media`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaType, mediaIndex })
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
    
    return response.json();
  }
};