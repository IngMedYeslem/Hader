import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { API_URL } from '../config/api';

// إعدادات الضغط — مُحسَّنة للإنترنت البطيء في موريتانيا
const COMPRESSION = {
  // صورة عرض القائمة (thumbnail) — خفيفة جداً للتصفح السريع
  thumbnail: { width: 400, quality: 0.45 },
  // صورة تفاصيل المنتج — جودة معقولة
  detail:    { width: 800, quality: 0.60 },
  // ويب
  web:       { maxWidth: 500, quality: 0.55 },
};

export const imageService = {
  // تحويل صورة محلية إلى base64 مع ضغط مُحسَّن
  convertToBase64: async (uri, mode = 'detail') => {
    try {
      if (uri.startsWith('data:')) return uri;

      if (Platform.OS === 'web') {
        return await imageService.compressImage(uri);
      }

      if (!uri.startsWith('file://')) return uri;

      const { width, quality } = COMPRESSION[mode] || COMPRESSION.detail;
      const { ImageManipulator, SaveFormat } = require('expo-image-manipulator');

      const context = ImageManipulator.manipulate(uri);
      context.resize({ width });
      const imageRef = await context.renderAsync();
      const manipulated = await imageRef.saveAsync({
        compress: quality,
        format: SaveFormat.JPEG,
      });

      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64 || base64.length < 100) {
        // fallback: أصلية بدون ضغط
        const original = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        }).catch(() => null);
        if (original && original.length > 100) return `data:image/jpeg;base64,${original}`;
        return uri;
      }

      const sizeKB = Math.round(base64.length / 1024);
      console.log(`📦 صورة مضغوطة [${mode}]: ${sizeKB} KB`);
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('خطأ في ضغط الصورة:', error.message);
      return uri;
    }
  },

  // ضغط صورة الويب عبر Canvas
  compressImage: async (dataUri) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { maxWidth, quality } = COMPRESSION.web;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (!compressed || compressed.length < 100 || !compressed.startsWith('data:image/')) {
          resolve(dataUri);
        } else {
          console.log(`📦 ضغط ويب: ${Math.round(compressed.length / 1024)} KB`);
          resolve(compressed);
        }
      };

      img.onerror = () => resolve(dataUri);
      img.src = dataUri;
    });
  },

  // معالجة مصفوفة صور
  processImages: async (images) => {
    if (!images || images.length === 0) return [];
    const valid = images.filter(img =>
      img.startsWith('file://') ||
      img.startsWith('data:')   ||
      img.startsWith('http')    ||
      img.startsWith('/uploads/')
    );
    return valid;
  },

  // رفع صورة إلى الخادم
  uploadImage: async (imageUri) => {
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'image.jpg');
      } else {
        formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'image.jpg' });
      }

      const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (response.ok) {
        const result = await response.json();
        return result.imageUrl;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      return null;
    }
  },
};
