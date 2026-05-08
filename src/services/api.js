import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

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

console.log('[api.js] BASE_URL:', API_URL);

// Construire l'URL complète pour les médias
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  
  console.log('🔗 Construction URL pour:', mediaPath);
  
  // Si c'est déjà une URL complète
  if (mediaPath.startsWith('http')) return mediaPath;

  const baseUrl = API_URL.replace('/api', '');
  const cleanPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  return `${baseUrl}${cleanPath}`;
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
      console.log('Produit:', { name: product.name, price: product.price, shopId: product.shopId });
      console.log('Images à traiter:', product.images?.length || 0);
      
      // Convertir tous les médias en URLs avant envoi
      const { uploadService } = require('./uploadService');
      const { images: imageUrls } = await uploadService.processMediaToUrls(
        product.images || []
      );
      
      const productData = {
        ...product,
        images: imageUrls
      };
      
      console.log('URLs finales - Images:', imageUrls.length);
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('=== Produit créé ===');
      console.log('ID:', result._id);
      console.log('URLs images:', result.images?.length || 0);
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

  uploadMedia: async (mediaData, mediaType = 'image') => {
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const blob = await fetch(mediaData).then(r => r.blob());
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        formData.append('media', blob, `media.${extension}`);
      } else {
        const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        
        formData.append('media', {
          uri: mediaData,
          type: mimeType,
          name: `media.${extension}`,
        });
      }
      
      const response = await fetch(`${API_URL}/upload-media`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      throw error;
    }
  },

  update: async (productId, productData) => {
    try {
      console.log('=== Mise à jour produit ===');
      console.log('ID:', productId);
      console.log('Données:', productData);
      
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('=== Produit mis à jour ===');
      return result;
    } catch (error) {
      console.error('❌ Erreur mise à jour produit:', error);
      throw error;
    }
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
  },

  delete: async (productId) => {
    try {
      console.log('=== Suppression produit ===');
      console.log('ID:', productId);
      
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.status === 404) {
        console.log('⚠️ Produit non trouvé sur le serveur, suppression locale uniquement');
        return { success: true, message: 'Produit supprimé localement' };
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur serveur: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('=== Produit supprimé du serveur ===');
      return result;
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        console.log('⚠️ Serveur non disponible, suppression locale uniquement');
        return { success: true, message: 'Produit supprimé localement (serveur indisponible)' };
      }
      console.error('❌ Erreur suppression produit:', error);
      throw error;
    }
  }
};