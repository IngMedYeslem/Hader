import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { API_URL } from '../config/api';

const OrderTracking = ({ route }) => {
  const { orderNumber, phoneNumber } = route.params;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/phone/${phoneNumber}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openTracking = (link) => {
    if (link) Linking.openURL(link);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      processing: '#9b59b6',
      shipped: '#1abc9c',
      delivered: '#2ecc71',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      {orders.map(order => (
        <View key={order._id} style={styles.orderCard}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderAmount}>{order.totalAmount} DH</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          {order.trackingLink && (
            <TouchableOpacity style={styles.trackButton} onPress={() => openTracking(order.trackingLink)}>
              <Text style={styles.trackButtonText}>Suivre la livraison</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  orderNumber: { fontSize: 18, fontWeight: 'bold' },
  orderAmount: { fontSize: 16, color: '#2ecc71', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  trackButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, marginTop: 12 },
  trackButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});

export default OrderTracking;
