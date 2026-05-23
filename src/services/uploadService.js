import { Platform } from 'react-native';

import { API_URL } from '../config/api';

// دالة مشتركة لتحويل file:// أو data: إلى data URI ورفعه كـ JSON
export const uploadFileAsJson = async (uri, endpoint) => {
  let dataUri = uri;

  if (Platform.OS !== 'web' && uri.startsWith('file://')) {
    const FileSystem = require('expo-file-system/legacy');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    dataUri = `data:image/jpeg;base64,${base64}`;
  }

  if (!dataUri.startsWith('data:')) return null;

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: dataUri }),
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
};

export const uploadService = {
  // Uploader un média et retourner l'URL
  uploadMedia: async (mediaUri, mediaType = 'image') => {
    try {
      console.log(`📤 Upload ${mediaType}:`, mediaUri.substring(0, 50) + '...');

      let dataUri = mediaUri;

      // تحويل file:// إلى base64 data URI
      if (Platform.OS !== 'web' && mediaUri.startsWith('file://')) {
        const FileSystem = require('expo-file-system/legacy');
        const base64 = await FileSystem.readAsStringAsync(mediaUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
        dataUri = `data:${mimeType};base64,${base64}`;
      }

      if (!dataUri.startsWith('data:')) {
        console.log('⚠️ Format non supporté:', mediaUri.substring(0, 50));
        return null;
      }

      console.log(`🚀 Envoi vers: ${API_URL}/upload-media`);
      const response = await fetch(`${API_URL}/upload-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: dataUri }),
      });

      console.log(`📊 Réponse status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload réussi:', result.mediaPath);
      return result.mediaPath;

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      return null;
    }
  },

  // Détecter le type de média
  detectMediaType: (uri) => {
    if (uri.startsWith('data:video/') || uri.includes('.mp4') || uri.includes('.mov') || uri.includes('.avi')) {
      return 'video';
    }
    return 'image';
  },

  // Traiter un tableau de médias et retourner les URLs
  processMediaToUrls: async (images = []) => {
    console.log('🔄 Conversion médias vers URLs...');
    
    const imageUrls = [];
    
    // Traiter les images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`🖼️ Traitement image ${i + 1}:`, image.substring(0, 50) + '...');
      
      if (image.startsWith('http') || image.startsWith('/uploads/')) {
        // Déjà une URL
        imageUrls.push(image);
        console.log('✅ Image déjà URL');
      } else if (image.startsWith('data:') || image.startsWith('file://')) {
        // Uploader et récupérer l'URL
        console.log('📤 Upload image nécessaire');
        const url = await uploadService.uploadMedia(image, 'image');
        if (url) {
          imageUrls.push(url);
          console.log('✅ Image uploadée:', url);
        } else {
          console.log('❌ Échec upload image');
        }
      }
    }
    
    console.log(`✅ Conversion terminée: ${imageUrls.length} images`);
    return { images: imageUrls };
  }
};