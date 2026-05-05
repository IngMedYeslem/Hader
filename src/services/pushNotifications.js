import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

let Notifications = null;
let Device = null;
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch (e) {}

if (Notifications) Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Fonction pour enregistrer les notifications push
async function registerForPushNotificationsAsync() {
  if (!Device || !Notifications) return null;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Permission non accordée !");
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'f4c5d89a-8df8-42e8-85d1-19deee902f1a'
    })).data;
    console.log("Expo Push Token:", token);
    return token;
  } else {
    alert("Doit être exécuté sur un appareil physique");
  }
}

// Fonction pour envoyer une notification push
async function sendPush(token, title, body) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title: title,
      body: body,
    }),
  });
}

class PushNotificationService {
  constructor() {
    this.isChecking = false;
    this.lastCheck = 0;
    this.shownNotifications = new Set();
  }

  async initialize() {
    const token = await this.registerForPushNotifications();
    if (token) {
      await this.sendTokenToServer(token);
    }
    this.setupMessageHandlers();
  }

  async registerForPushNotifications() {
    return await registerForPushNotificationsAsync();
  }

  async sendNotification(token, title, body) {
    return await sendPush(token, title, body);
  }

  async getToken() {
    try {
      if (!Device || !Device.isDevice) {
        console.log('Mode web - simulation notifications push');
        const webToken = 'web-dev-token-' + Math.random().toString(36).substr(2, 9);
        return webToken;
      }
      
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem('expoPushToken', token);
      }
      return token;
    } catch (error) {
      console.log('Mode développement - token simulé');
      return 'fallback-token-' + Date.now();
    }
  }

  async sendTokenToServer(token) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const shopData = await AsyncStorage.getItem('currentShop');
      let targetId = userId;
      
      if (!userId && shopData) {
        try {
          const shop = JSON.parse(shopData);
          // Chercher l'utilisateur lié à cette boutique
          const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
          if (response.ok) {
            const users = await response.json();
            const linkedUser = users.find(user => 
              user.linkedShop && user.linkedShop.id === shop._id
            );
            if (linkedUser) {
              targetId = linkedUser.id;
              console.log('👤 Utilisation ID utilisateur lié:', targetId);
            } else {
              targetId = shop._id;
              console.log('🏪 Fallback ID boutique:', targetId);
            }
          }
        } catch (e) {
          console.error('Erreur parsing shop data:', e);
        }
      }
      
      if (!targetId) {
        console.log('❌ Aucun ID utilisateur trouvé');
        return;
      }

      console.log('📤 Envoi token pour ID:', targetId);
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/expo-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: targetId, 
          expoPushToken: token 
        })
      });
      
      const result = await response.json();
      console.log('✅ Token envoyé:', result.message);
    } catch (error) {
      console.error('❌ Erreur envoi token:', error);
    }
  }

  setupMessageHandlers() {
    if (!Notifications) return;
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification cliquée:', response);
    });
    
    // Vérification périodique pour le web (réduite à 30 secondes)
    setInterval(() => {
      this.checkForWebNotifications();
    }, 30000); // Toutes les 30 secondes au lieu de 10
  }
  
  async checkForWebNotifications() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5s
      
      const notifications = await this.getAllNotifications();
      clearTimeout(timeoutId);
      
      for (const notification of notifications) {
        if (!notification.read) {
          console.log('🔔 NOTIFICATION WEB:', notification.title);
          console.log('💬 MESSAGE:', notification.body);
          
          await this.markNotificationAsRead(notification._id);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏱️ Timeout vérification notifications (ignoré)');
      } else {
        console.error('Erreur vérification notifications web:', error);
      }
    }
  }
  
  async checkPendingNotifications() {
    if (this.isChecking) return;
    
    const now = Date.now();
    if (now - this.lastCheck < 25000) return; // Minimum 25s entre vérifications
    
    this.isChecking = true;
    this.lastCheck = now;
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      const shopData = await AsyncStorage.getItem('currentShop');
      let targetId = userId;
      
      if (shopData) {
        try {
          const shop = JSON.parse(shopData);
          const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
          if (response.ok) {
            const users = await response.json();
            const linkedUser = users.find(user => 
              user.linkedShop && user.linkedShop.id === shop._id
            );
            if (linkedUser) {
              targetId = linkedUser.id;
            } else {
              targetId = shop._id;
            }
          }
        } catch (e) {
          console.error('Erreur parsing shop data:', e);
        }
      }
      
      if (!targetId) return;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${targetId}/notifications`);
      if (!response.ok) return;
      
      const notifications = await response.json();
      
      for (const notification of notifications) {
        if (!notification.read && !this.shownNotifications.has(notification._id)) {
          this.shownNotifications.add(notification._id);
          
          if (Notifications) await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: notification.data
            },
            trigger: null
          });
          
          await this.markNotificationAsRead(notification._id);
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification notifications:', error);
    } finally {
      this.isChecking = false;
    }
  }
  
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        console.log(`✅ Notification ${notificationId} marquée comme lue`);
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }
  
  async getAllNotifications() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const shopData = await AsyncStorage.getItem('currentShop');
      let targetId = userId;
      
      if (!userId && shopData) {
        try {
          const shop = JSON.parse(shopData);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const users = await response.json();
            const linkedUser = users.find(user => 
              user.linkedShop && user.linkedShop.id === shop._id
            );
            if (linkedUser) {
              targetId = linkedUser.id;
            } else {
              targetId = shop._id;
            }
          }
        } catch (e) {
          if (e.name === 'AbortError') {
            console.log('⏱️ Timeout récupération utilisateurs');
          }
          return [];
        }
      }
      
      if (!targetId) return [];
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${targetId}/notifications`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erreur récupération notifications:', error);
      }
      return [];
    }
  }
}

export default new PushNotificationService();