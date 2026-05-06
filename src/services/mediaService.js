import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const getApiUrl = () => {
  return __DEV__ && Platform.OS !== 'web'
    ? 'http://192.168.0.110:3000/api'
    : 'http://localhost:3000/api';
};

export const mediaService = {
  processMedia: async (images = []) => {
    const processedImages = [];

    for (const image of images) {
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

    return { images: processedImages };
  },

  uploadMedia: async (mediaUri) => {
    try {
      const API_URL = getApiUrl();
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(mediaUri);
        const blob = await response.blob();
        formData.append('media', blob, 'media.jpg');
      } else {
        formData.append('media', { uri: mediaUri, type: 'image/jpeg', name: 'media.jpg' });
      }

      const response = await fetch(`${API_URL}/upload-media`, { method: 'POST', body: formData });
      if (response.ok) {
        const result = await response.json();
        return result.mediaPath;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      return null;
    }
  }
};
