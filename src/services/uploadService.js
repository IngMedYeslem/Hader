import { Platform } from 'react-native';

const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.0.138:3000/api'
    : 'http://localhost:3000/api';
};

export const uploadService = {
  // Uploader un média et retourner l'URL
  uploadMedia: async (mediaUri, mediaType = 'image') => {
    try {
      console.log(`📤 Upload ${mediaType}:`, mediaUri.substring(0, 50) + '...');
      
      const API_URL = getApiUrl();
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
  processMediaToUrls: async (images = [], videos = []) => {
    console.log('🔄 Conversion médias vers URLs...');
    
    const imageUrls = [];
    const videoUrls = [];
    
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
    
    // Traiter les vidéos
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`🎬 Traitement vidéo ${i + 1}:`, video.substring(0, 50) + '...');
      
      if (video.startsWith('http') || video.startsWith('/uploads/')) {
        // Déjà une URL
        videoUrls.push(video);
        console.log('✅ Vidéo déjà URL');
      } else if (video.startsWith('data:') || video.startsWith('file://')) {
        // Uploader et récupérer l'URL
        console.log('📤 Upload vidéo nécessaire');
        const url = await uploadService.uploadMedia(video, 'video');
        if (url) {
          videoUrls.push(url);
          console.log('✅ Vidéo uploadée:', url);
        } else {
          console.log('❌ Échec upload vidéo');
        }
      }
    }
    
    console.log(`✅ Conversion terminée: ${imageUrls.length} images, ${videoUrls.length} vidéos`);
    return { images: imageUrls, videos: videoUrls };
  }
};