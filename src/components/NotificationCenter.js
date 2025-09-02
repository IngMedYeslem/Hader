import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import pushNotificationService from '../services/pushNotifications';
import styles from './styles';

const NotificationCenter = ({ userId, shopId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [userId, shopId]);

  const loadNotifications = async () => {
    if (Platform.OS === 'web') return; // Pas de notifications sur web
    
    setLoading(true);
    try {
      const notifs = await pushNotificationService.getAllNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await pushNotificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? '#f8f9fa' : '#e3f2fd' }
      ]}
      onPress={() => !item.read && markAsRead(item._id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      {!item.read && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.notificationCenter}>
        <Text style={styles.notificationTitle}>
          Les notifications ne sont disponibles que sur mobile
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.notificationCenter}>
      <View style={styles.notificationHeader}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>Aucune notification</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NotificationCenter;