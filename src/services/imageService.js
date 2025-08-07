import { Platform } from 'react-native';

// URL API dynamique
const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.100.121:3000/api'
    : 'http://localhost:3000/api';
};

export const imageService = {
  // Convertir une image locale en base64 avec compression
  convertToBase64: async (uri) => {
    try {
      console.log('🔄 Conversion image:', uri.substring(0, 50) + '...');
      
      if (Platform.OS === 'web') {
        console.log('🌐 Web: Compression image...');
        return await imageService.compressImage(uri);
      }

      if (!uri.startsWith('file://')) {
        console.log('ℹ️ Pas une image locale, retour direct');
        return uri;
      }

      // Pour mobile, utiliser ImageManipulator pour compresser
      const ImageManipulator = require('expo-image-manipulator');
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Redimensionner à 800px de largeur max
        { 
          compress: 0.7, // Compression à 70%
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      const FileSystem = require('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const dataUri = `data:image/jpeg;base64,${base64}`;
      console.log('✅ Conversion et compression réussies:', dataUri.substring(0, 50) + '...');
      return dataUri;
    } catch (error) {
      console.error('❌ Erreur conversion base64:', error);
      return uri;
    }
  },

  // Compresser une image web
  compressImage: async (dataUri) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner si trop grande
        const maxWidth = 800;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compresser à 70%
        const compressedDataUri = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUri);
      };
      
      img.src = dataUri;
    });
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