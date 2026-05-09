import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { API_CONFIG } from '../config/api';

const NotificationsList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const url = `${API_CONFIG.BASE_URL}/notifications/${userId}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Notifications fetch failed (ignored)');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch {}
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unread]}
      onPress={() => markAsRead(item._id)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('ar-MA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      {!item.read && <View style={styles.badge} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>لا توجد إشعارات</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  list: {
    padding: 16
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  unread: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333'
  },
  body: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8
  },
  date: {
    fontSize: 12,
    color: '#777'
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196f3'
  },
  emptyText: {
    fontSize: 16,
    color: '#777'
  }
});

export default NotificationsList;
