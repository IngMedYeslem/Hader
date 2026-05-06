import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import pushNotificationService from '../services/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationTest() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const pushToken = await pushNotificationService.getToken();
      setToken(pushToken);
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      Alert.alert('Erreur', 'Token non disponible');
      return;
    }

    try {
      await pushNotificationService.sendNotification(
        token,
        'Test Notification',
        'Ceci est un test de notification push!'
      );
      Alert.alert('Succès', 'Notification envoyée!');
    } catch (error) {
      Alert.alert('Erreur', 'Échec envoi notification');
      console.error('Erreur envoi:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Test Notifications Push</Text>
      
      <Text style={{ marginBottom: 10 }}>
        Token: {token ? token.substring(0, 20) + '...' : 'Non disponible'}
      </Text>
      
      <TouchableOpacity
        onPress={sendTestNotification}
        style={{
          backgroundColor: '#FF6B35',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Envoyer Test Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
}