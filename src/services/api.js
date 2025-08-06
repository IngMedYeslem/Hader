import { Platform } from 'react-native';

// Utiliser l'IP locale pour les smartphones
const API_URL = __DEV__ && Platform.OS !== 'web' 
  ? 'http://192.168.100.121:3000/api'  // Remplacez par votre IP locale
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
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    return response.json();
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