import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web' 
    ? 'http://192.168.0.138:3000/api'
    : 'http://localhost:3000/api';
};

export const mediaService = {
  // Convertir une vidéo locale en base64 avec compression
  convertVideoToBase64: async (uri) => {
    try {
      console.log('🎬 Conversion vidéo:', uri.substring(0, 50) + '...');
      
      if (Platform.OS === 'web') {
        // Pour le web, lire le fichier comme blob puis convertir
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Vérifier la taille du fichier
        const sizeInMB = blob.size / (1024 * 1024);
        console.log(`Taille vidéo: ${sizeInMB.toFixed(2)} MB`);
        
        if (sizeInMB > 20) {
          console.log('⚠️ Vidéo trop volumineuse (>20MB), compression recommandée');
        }
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      if (!uri.startsWith('file://')) {
        console.log('ℹ️ Pas une vidéo locale, retour direct');
        return uri;
      }
      
      console.log('📱 Traitement vidéo locale mobile...');
      
      // Vérifier la taille du fichier avant lecture
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const sizeInMB = fileInfo.size / (1024 * 1024);
      console.log(`Taille vidéo: ${sizeInMB.toFixed(2)} MB`);
      
      if (sizeInMB > 20) {
        console.log('⚠️ Vidéo trop volumineuse (>20MB), réduction recommandée');
        // Ici on pourrait ajouter une compression avec expo-av ou ffmpeg
      }
      
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64'
      });
      
      const dataUri = `data:video/mp4;base64,${base64}`;
      console.log('✅ Conversion vidéo réussie:', dataUri.substring(0, 50) + '...');
      return dataUri;
    } catch (error) {
      console.error('❌ Erreur conversion vidéo base64:', error);
      return uri;
    }
  },

  // Traiter un tableau de médias (images + vidéos)
  processMedia: async (images = [], videos = []) => {
    console.log('🔄 Traitement médias:', images.length, 'images,', videos.length, 'vidéos');
    
    const processedImages = [];
    const processedVideos = [];
    
    // Traiter les images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image.startsWith('file://')) {
        const { imageService } = require('./imageService');
        const base64Image = await imageService.convertToBase64(image);
        if (base64Image && base64Image.startsWith('data:')) {
          processedImages.push(base64Image);
        }
      } else if (image.startsWith('data:') || image.startsWith('http')) {
        processedImages.push(image);
      }
    }
    
    // Traiter les vidéos
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      if (video.startsWith('file://')) {
        const base64Video = await mediaService.convertVideoToBase64(video);
        if (base64Video && base64Video.startsWith('data:')) {
          processedVideos.push(base64Video);
        }
      } else if (video.startsWith('data:') || video.startsWith('http')) {
        processedVideos.push(video);
      }
    }
    
    console.log('✅ Traitement terminé:', processedImages.length, 'images,', processedVideos.length, 'vidéos');
    return { images: processedImages, videos: processedVideos };
  },

  // Uploader un média vers le serveur
  uploadMedia: async (mediaUri, mediaType = 'image') => {
    try {
      const API_URL = getApiUrl();
      console.log('📤 Upload média vers:', API_URL);

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(mediaUri);
        const blob = await response.blob();
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        formData.append('media', blob, `media.${extension}`);
      } else {
        const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
        const extension = mediaType === 'video' ? 'mp4' : 'jpg';
        
        formData.append('media', {
          uri: mediaUri,
          type: mimeType,
          name: `media.${extension}`,
        });
      }

      const response = await fetch(`${API_URL}/upload-media`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload média réussi:', result.mediaPath);
        return result.mediaPath;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      return null;
    }
  }
};