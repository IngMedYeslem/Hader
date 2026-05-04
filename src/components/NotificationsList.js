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
      console.log(`📱 جلب الإشعارات للمستخدم: ${userId}`);
      const url = `${API_CONFIG.BASE_URL.replace('/api', '')}/api/notifications/${userId}`;
      console.log('🔗 URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ تم جلب ${data.length} إشعار`);
      setNotifications(data);
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
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
      const url = `${API_CONFIG.BASE_URL.replace('/api', '')}/api/notifications/${notificationId}/read`;
      await fetch(url, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
    }
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
    color: '#666',
    marginBottom: 8
  },
  date: {
    fontSize: 12,
    color: '#999'
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
    color: '#999'
  }
});

export default NotificationsList;
