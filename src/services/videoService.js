import { Platform } from 'react-native';

export const videoService = {
  // Générer une miniature pour une vidéo (version simplifiée)
  generateThumbnail: async (videoUri) => {
    try {
      console.log('🎬 Préparation miniature pour:', videoUri.substring(0, 50) + '...');
      
      if (Platform.OS === 'web') {
        // Pour le web, retourner l'URI vidéo avec un timestamp
        return `${videoUri}#t=1`;
      }

      // Pour mobile, retourner l'URI vidéo directement
      // La miniature sera gérée par le composant vidéo lui-même
      console.log('✅ Utilisation URI vidéo:', videoUri);
      return videoUri;
    } catch (error) {
      console.error('❌ Erreur préparation miniature:', error);
      return videoUri;
    }
  },

  // Vérifier si c'est une URL vidéo
  isVideoUrl: (uri) => {
    if (!uri) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    return videoExtensions.some(ext => uri.toLowerCase().includes(ext)) ||
           uri.includes('video') ||
           uri.startsWith('data:video/');
  },

  // Obtenir le type MIME pour une vidéo
  getVideoMimeType: (uri) => {
    if (uri.includes('.mp4')) return 'video/mp4';
    if (uri.includes('.mov')) return 'video/quicktime';
    if (uri.includes('.webm')) return 'video/webm';
    return 'video/mp4'; // Par défaut
  }
};