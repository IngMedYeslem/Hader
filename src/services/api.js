import { Platform } from 'react-native';

// Utiliser l'IP locale pour les smartphones
const API_URL = __DEV__ && Platform.OS !== 'web' 
  ? 'http://192.168.1.122:3000/api'  // Remplacez par votre IP locale
  : 'http://localhost:3000/api';

console.log('API_URL:', API_URL);

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

  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/shops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
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
      
      // Vérifier la taille des images
      if (product.images) {
        product.images.forEach((img, i) => {
          console.log(`Image ${i + 1}: ${img.substring(0, 30)}... (${img.length} chars)`);
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
  }
};