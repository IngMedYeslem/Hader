import { Platform } from 'react-native';

import { API_URL } from '../config/api';

export const uploadService = {
  // Uploader un média et retourner l'URL
  uploadMedia: async (mediaUri, mediaType = 'image') => {
    try {
      console.log(`📤 Upload ${mediaType}:`, mediaUri.substring(0, 50) + '...');
      
      
      const formData = new FormData();
      
      if (mediaUri.startsWith('data:')) {
        // Convertir base64 en blob - Version simplifiée et robuste
        const response = await fetch(mediaUri);
        const blob = await response.blob();
        
        console.log(`📎 Blob créé: ${blob.size} bytes, type: ${blob.type}`);
        
        if (blob.size === 0) {
          console.error('❌ Blob vide, abandon upload');
          return null;
        }
        
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        formData.append('media', blob, `media.${extension}`);
      } else if (Platform.OS !== 'web' && mediaUri.startsWith('file://')) {
        // Mobile - fichier local
        const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        
        formData.append('media', {
          uri: mediaUri,
          type: mimeType,
          name: `media.${extension}`,
        });
        console.log(`📱 Fichier mobile préparé: ${mimeType}`);
      } else {
        console.log('⚠️ Format non supporté:', mediaUri.substring(0, 50));
        return null;
      }
      


      console.log(`🚀 Envoi vers: ${API_URL}/upload-media`);
      const response = await fetch(`${API_URL}/upload-media`, {
        method: 'POST',
        body: formData,
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