import { Platform } from 'react-native';

// URL API dynamique
const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.100.121:3000/api'
    : 'http://localhost:3000/api';
};

export const imageService = {
  // Convertir une image locale en base64
  convertToBase64: async (uri) => {
    try {
      console.log('🔄 Conversion image:', uri.substring(0, 50) + '...');
      
      if (Platform.OS === 'web') {
        console.log('🌐 Web: Image déjà en base64');
        return uri;
      }

      if (!uri.startsWith('file://')) {
        console.log('ℹ️ Pas une image locale, retour direct');
        return uri;
      }

      // Pour mobile, lire le fichier local
      const FileSystem = require('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const mimeType = uri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${base64}`;
      
      console.log('✅ Conversion réussie:', dataUri.substring(0, 50) + '...');
      return dataUri;
    } catch (error) {
      console.error('❌ Erreur conversion base64:', error);
      return uri;
    }
  },

  // Traiter un tableau d'images
  processImages: async (images) => {
    if (!images || images.length === 0) return [];
    
    const processedImages = [];
    
    for (const image of images) {
      if (image.startsWith('file://')) {
        // Convertir les images locales
        const base64Image = await imageService.convertToBase64(image);
        processedImages.push(base64Image);
      } else {
        // Garder les images déjà traitées
        processedImages.push(image);
      }
    }
    
    return processedImages;
  },

  // Uploader une image vers le serveur (optionnel)
  uploadImage: async (imageUri) => {
    try {
      const API_URL = getApiUrl();
      console.log('📤 Upload vers:', API_URL);

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'image.jpg');
      } else {
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload réussi:', result.imageUrl);
        return result.imageUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      return null;
    }
  }
};