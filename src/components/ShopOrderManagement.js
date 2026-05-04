import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../config/api';

const ShopOrderManagement = ({ shopId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingLink, setTrackingLink] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/shops/${shopId}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingLink: trackingLink || undefined })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Statut mis à jour');
        fetchOrders();
        setSelectedOrder(null);
        setTrackingLink('');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Mise à jour échouée');
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(item)}
    >
      <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
      <Text style={styles.orderPhone}>{item.phoneNumber}</Text>
      <Text style={styles.orderAmount}>{item.totalAmount} DH</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

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

  if (selectedOrder) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Commande #{selectedOrder.orderNumber}</Text>
        <Text style={styles.detail}>Client: {selectedOrder.phoneNumber}</Text>
        <Text style={styles.detail}>Montant: {selectedOrder.totalAmount} DH</Text>
        <Text style={styles.detail}>Adresse: {selectedOrder.shippingAddress}</Text>
        
        <Text style={styles.subtitle}>Produits:</Text>
        {selectedOrder.items.map((item, index) => (
          <Text key={index} style={styles.item}>
            • {item.name} x{item.quantity} - {item.price} DH
          </Text>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Lien de suivi (optionnel)"
          value={trackingLink}
          onChangeText={setTrackingLink}
        />

        <View style={styles.statusButtons}>
          {['confirmed', 'processing', 'shipped', 'delivered'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.statusButton, { backgroundColor: getStatusColor(status) }]}
              onPress={() => updateOrderStatus(selectedOrder._id, status)}
            >
              <Text style={styles.statusButtonText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        refreshing={false}
        onRefresh={fetchOrders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  orderNumber: { fontSize: 18, fontWeight: 'bold' },
  orderPhone: { fontSize: 14, color: '#666', marginTop: 4 },
  orderAmount: { fontSize: 16, color: '#2ecc71', marginTop: 4 },
  orderDate: { fontSize: 12, color: '#999', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#3498db' },
  detail: { fontSize: 16, marginBottom: 8 },
  item: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginTop: 16 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  statusButton: { padding: 12, borderRadius: 8, margin: 4, minWidth: 100 },
  statusButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});

export default ShopOrderManagement;
