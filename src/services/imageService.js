import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// URL API dynamique
const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.0.104:3000/api'
    : 'http://localhost:3000/api';
};

export const imageService = {
  // تحويل صورة محلية إلى base64 مع ضغط
  convertToBase64: async (uri) => {
    try {
      console.log('🔄 تحويل صورة:', uri.substring(0, 50) + '...');
      
      // إذا كانت محولة بالفعل
      if (uri.startsWith('data:')) {
        console.log('✅ الصورة محولة بالفعل');
        return uri;
      }
      
      if (Platform.OS === 'web') {
        console.log('🌐 Web: ضغط الصورة...');
        return await imageService.compressImage(uri);
      }

      if (!uri.startsWith('file://')) {
        console.log('ℹ️ ليست صورة محلية، إرجاع مباشر');
        return uri;
      }
      
      console.log('📱 معالجة صورة محلية من الهاتف...');

      // للهاتف، استخدام ImageManipulator للضغط
      const ImageManipulator = require('expo-image-manipulator');
      
      console.log('🔧 ضغط الصورة...');
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { 
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      console.log('💾 قراءة الصورة كـ base64...');
      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      if (!base64 || base64.length < 100) {
        console.error('❌ صورة base64 قصيرة جداً، محاولة بدون ضغط...');
        
        try {
          const originalBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          if (originalBase64 && originalBase64.length > 100) {
            const dataUri = `data:image/jpeg;base64,${originalBase64}`;
            console.log('✅ استخدام الصورة الأصلية بدون ضغط');
            return dataUri;
          }
        } catch (originalError) {
          console.error('❌ فشل قراءة الصورة الأصلية:', originalError);
        }
        
        return uri;
      }
      
      const dataUri = `data:image/jpeg;base64,${base64}`;
      console.log('✅ تحويل وضغط ناجح:', dataUri.substring(0, 50) + '...');
      console.log('📊 حجم base64:', Math.round(base64.length / 1024), 'KB');
      
      return dataUri;
    } catch (error) {
      console.error('❌ خطأ في تحويل base64:', error);
      console.error('❌ تفاصيل الخطأ:', error.message);
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