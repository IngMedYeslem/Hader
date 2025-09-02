import pushNotificationService from '../services/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationHelper = {
  // Envoyer une notification à l'utilisateur actuel
  async sendToCurrentUser(title, body) {
    try {
      const token = await AsyncStorage.getItem('expoPushToken');
      if (token) {
        await pushNotificationService.sendNotification(token, title, body);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      return false;
    }
  },

  // Envoyer une notification à un token spécifique
  async sendToToken(token, title, body) {
    try {
      await pushNotificationService.sendNotification(token, title, body);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      return false;
    }
  },

  // Obtenir le token actuel
  async getCurrentToken() {
    try {
      return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }
};