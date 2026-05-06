import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// URL API dynamique
const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.0.110:3000/api'
    : 'http://localhost:3000/api';
};

export const imageService = {
  // Convertir une image locale en base64 avec compression - Version améliorée
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
      
      console.log('📱 Traitement image locale mobile...');

      // Pour mobile, utiliser ImageManipulator pour compresser
      const ImageManipulator = require('expo-image-manipulator');
      
      // Réduire la compression pour éviter les images trop dégradées
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Taille plus grande pour garder la qualité
        { 
          compress: 0.7, // Compression moins agressive
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: 'base64'
      });
      
      // Vérifier que l'image base64 est valide
      if (!base64 || base64.length < 100) {
        console.error('❌ Image base64 trop courte ou vide, tentative sans compression...');
        
        // Tentative sans compression
        try {
          const originalBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64'
          });
          
          if (originalBase64 && originalBase64.length > 100) {
            const dataUri = `data:image/jpeg;base64,${originalBase64}`;
            console.log('✅ Image originale utilisée sans compression');
            return dataUri;
          }
        } catch (originalError) {
          console.error('❌ Échec lecture image originale:', originalError);
        }
        
        return uri; // Retourner l'URI originale
      }
      
      const dataUri = `data:image/jpeg;base64,${base64}`;
      console.log('✅ Conversion et compression réussies:', dataUri.substring(0, 50) + '...');
      console.log('📊 Taille base64:', base64.length, 'caractères');
      
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
        const maxWidth = 600;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compresser à 50% pour réduire la taille
        const compressedDataUri = canvas.toDataURL('image/jpeg', 0.7); // Compression moins agressive
        
        // Vérifier que l'image compressée est valide
        if (!compressedDataUri || compressedDataUri.length < 100 || !compressedDataUri.startsWith('data:image/')) {
          console.error('❌ Image compressée invalide, utilisation de l\'originale');
          resolve(dataUri); // Retourner l'image originale
        } else {
          console.log('✅ Compression web réussie, taille:', compressedDataUri.length);
          resolve(compressedDataUri);
        }
      };
      
      img.src = dataUri;
    });
  },

  // Traiter un tableau d'images - Version simplifiée
  processImages: async (images) => {
    if (!images || images.length === 0) return [];
    
    console.log('🔄 Traitement de', images.length, 'images');
    const processedImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Image ${i + 1}:`, image.substring(0, 50) + '...');
      
      // Accepter toutes les images valides sans conversion automatique
      if (image.startsWith('file://') || image.startsWith('data:') || image.startsWith('http') || image.startsWith('/uploads/')) {
        processedImages.push(image);
        console.log('✅ Image acceptée');
      } else {
        console.log('⚠️ Format image non reconnu, ignorée');
      }
    }
    
    console.log('✅ Traitement terminé:', processedImages.length, 'images valides');
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