import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { API_CONFIG } from '../config/api';
import PaymentRejectionHandler from './PaymentRejectionHandler';
import { useTranslation } from '../translations';

const API_URL = API_CONFIG.BASE_URL;

const OrderTracking = ({ route }) => {
  const { orderNumber, phoneNumber } = route.params;
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [orders, setOrders] = useState([]);
  const [selectedRejectedOrder, setSelectedRejectedOrder] = useState(null);

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

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pending: '#f39c12',
      receipt_uploaded: '#3498db',
      confirmed: '#2ecc71',
      rejected: '#e74c3c'
    };
    return colors[paymentStatus] || '#95a5a6';
  };

  const getPaymentStatusText = (paymentStatus) => {
    const texts = {
      pending: isRTL ? 'في الانتظار' : 'En attente',
      receipt_uploaded: isRTL ? 'تم رفع الإيصال' : 'Reçu téléchargé',
      confirmed: isRTL ? 'تم التأكيد' : 'Confirmé',
      rejected: isRTL ? 'مرفوض' : 'Rejeté'
    };
    return texts[paymentStatus] || paymentStatus;
  };

  const handleRejectedPayment = (order) => {
    if (order.paymentStatus === 'rejected' && order.paymentMethod === 'bank') {
      setSelectedRejectedOrder(order);
    }
  };

  const onReceiptUploaded = (updatedOrder) => {
    setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    setSelectedRejectedOrder(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRTL ? 'طلباتي' : 'Mes commandes'}
      </Text>
      {orders.map(order => (
        <View key={order._id} style={styles.orderCard}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderAmount}>{order.totalAmount} MRU</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          
          {/* Payment Status */}
          {order.paymentMethod === 'bank' && (
            <View style={[
              styles.paymentStatusBadge, 
              { backgroundColor: getPaymentStatusColor(order.paymentStatus) }
            ]}>
              <Text style={styles.statusText}>
                {getPaymentStatusText(order.paymentStatus)}
              </Text>
            </View>
          )}
          
          {/* Rejected Payment Alert */}
          {order.paymentStatus === 'rejected' && order.paymentMethod === 'bank' && (
            <TouchableOpacity 
              style={styles.rejectedAlert}
              onPress={() => handleRejectedPayment(order)}
            >
              <Text style={styles.rejectedText}>
                ❌ {isRTL ? 'تم رفض الإيصال - اضغط لرفع إيصال جديد' : 'Reçu rejeté - Appuyer pour télécharger un nouveau'}
              </Text>
            </TouchableOpacity>
          )}
          
          {order.trackingLink && (
            <TouchableOpacity 
              style={styles.trackButton} 
              onPress={() => openTracking(order.trackingLink)}
            >
              <Text style={styles.trackButtonText}>
                {isRTL ? 'تتبع التوصيل' : 'Suivre la livraison'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      {/* Payment Rejection Handler */}
      <PaymentRejectionHandler
        order={selectedRejectedOrder}
        visible={!!selectedRejectedOrder}
        onClose={() => setSelectedRejectedOrder(null)}
        onReceiptUploaded={onReceiptUploaded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  orderNumber: { fontSize: 18, fontWeight: 'bold' },
  orderAmount: { fontSize: 16, color: '#2ecc71', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  paymentStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  rejectedAlert: { 
    backgroundColor: '#ffebee', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c'
  },
  rejectedText: { 
    color: '#c62828', 
    fontSize: 13, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  trackButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, marginTop: 12 },
  trackButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});

export default OrderTracking;
