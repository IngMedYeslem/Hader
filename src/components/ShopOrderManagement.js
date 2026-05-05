import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  RefreshControl, SafeAreaView, ScrollView, Image, Vibration
} from 'react-native';
import { API_CONFIG } from '../config/api';
import { useTranslation } from '../translations';

const BASE = API_CONFIG.BASE_URL;

const STATUS_FLOW = [
  { id: 'pending',    labelAr: 'معلق',         labelFr: 'En attente',    color: '#f39c12', icon: '📋' },
  { id: 'confirmed',  labelAr: 'مؤكد',         labelFr: 'Confirmé',      color: '#3498db', icon: '✅' },
  { id: 'preparing',  labelAr: 'قيد التحضير',  labelFr: 'En préparation',color: '#9b59b6', icon: '👨‍🍳' },
  { id: 'on_the_way', labelAr: 'في الطريق',    labelFr: 'En route',      color: '#1abc9c', icon: '🛵' },
  { id: 'delivered',  labelAr: 'تم التوصيل',   labelFr: 'Livré',         color: '#2ecc71', icon: '🎉' },
  { id: 'cancelled',  labelAr: 'ملغي',         labelFr: 'Annulé',        color: '#e74c3c', icon: '❌' },
];

const getStatus = (id) => STATUS_FLOW.find(s => s.id === id) || STATUS_FLOW[0];

export default function ShopOrderManagement({ shopId, onClose }) {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const prevOrderIds = useRef(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${BASE}/shops/${shopId}/orders`);
      if (response.ok) {
        const data = await response.json();
        // Detect new orders
        if (prevOrderIds.current.size > 0) {
          const newOrders = data.filter(o => !prevOrderIds.current.has(o._id) && o.status === 'pending');
          if (newOrders.length > 0) {
            Vibration.vibrate([0, 400, 200, 400]);
            setNewOrderAlert(newOrders[0]);
          }
        }
        prevOrderIds.current = new Set(data.map(o => o._id));
        setOrders(data);
      }
    } catch (e) {
      console.log('Orders fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const confirmPaymentReceipt = async (orderId, status) => {
    try {
      await fetch(`${BASE}/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: status } : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, paymentStatus: status }));
    } catch (e) {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل التحديث' : 'Mise à jour échouée');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل تحديث الحالة' : 'Mise à jour échouée');
    }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const displayOrders = activeTab === 'active' ? activeOrders : orders;

  // ── Order Detail View ──
  if (selectedOrder) {
    const status = getStatus(selectedOrder.status);
    const nextStatuses = STATUS_FLOW.filter(s =>
      s.id !== selectedOrder.status && s.id !== 'pending' && s.id !== 'cancelled'
    );

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ backgroundColor: '#FF6B35', padding: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setSelectedOrder(null)}>
            <Text style={{ color: 'white', fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: 'bold' }}>
            #{selectedOrder.orderNumber}
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Status Badge */}
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>{status.icon}</Text>
            <View style={{ backgroundColor: status.color, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                {isRTL ? status.labelAr : status.labelFr}
              </Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: 15, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? '👤 معلومات العميل' : '👤 Informations client'}
            </Text>
            <InfoRow label={isRTL ? 'الهاتف' : 'Téléphone'} value={selectedOrder.phoneNumber} isRTL={isRTL} />
            <InfoRow label={isRTL ? 'العنوان' : 'Adresse'} value={selectedOrder.shippingAddress} isRTL={isRTL} />
            <InfoRow label={isRTL ? 'الدفع' : 'Paiement'} value={selectedOrder.paymentMethod === 'cash' ? (isRTL ? 'عند الاستلام' : 'À la livraison') : (isRTL ? 'تحويل بنكي' : 'Virement bancaire')} isRTL={isRTL} />
          </View>

          {/* Payment Receipt */}
          {selectedOrder.paymentMethod === 'bank' && (
            <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: 15, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '🧾 إيصال الدفع البنكي' : '🧾 Reçu de virement'}
              </Text>
              {selectedOrder.paymentReceiptUrl ? (
                <>
                  <Image
                    source={{ uri: `${BASE.replace('/api', '')}${selectedOrder.paymentReceiptUrl}` }}
                    style={{ width: '100%', height: 220, borderRadius: 10, marginBottom: 12 }}
                    resizeMode="contain"
                  />
                  {selectedOrder.paymentStatus === 'receipt_uploaded' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => confirmPaymentReceipt(selectedOrder._id, 'confirmed')}
                        style={{ flex: 1, backgroundColor: '#2ecc71', padding: 12, borderRadius: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                          {isRTL ? '✅ تأكيد الدفع' : '✅ Confirmer'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmPaymentReceipt(selectedOrder._id, 'rejected')}
                        style={{ flex: 1, backgroundColor: '#e74c3c', padding: 12, borderRadius: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                          {isRTL ? '❌ رفض الإيصال' : '❌ Rejeter'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedOrder.paymentStatus === 'confirmed' && (
                    <View style={{ backgroundColor: '#d4edda', padding: 10, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#155724', fontWeight: 'bold' }}>
                        {isRTL ? '✅ تم تأكيد الدفع' : '✅ Paiement confirmé'}
                      </Text>
                    </View>
                  )}
                  {selectedOrder.paymentStatus === 'rejected' && (
                    <View style={{ backgroundColor: '#f8d7da', padding: 10, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#721c24', fontWeight: 'bold' }}>
                        {isRTL ? '❌ تم رفض الإيصال' : '❌ Reçu rejeté'}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={{ backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#856404' }}>
                    {isRTL ? '⏳ في انتظار رفع الإيصال من الزبون' : '⏳ En attente du reçu du client'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Order Items */}
          <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: 15, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? '🛒 المنتجات' : '🛒 Produits'}
            </Text>
            {(selectedOrder.items || []).map((item, i) => (
              <View key={i} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < selectedOrder.items.length - 1 ? 1 : 0, borderBottomColor: '#f5f5f5' }}>
                <Text style={{ color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={{ fontWeight: '600', color: '#FF6B35' }}>
                  {item.price * item.quantity} MRU
                </Text>
              </View>
            ))}
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2C3E50' }}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FF6B35' }}>{selectedOrder.totalAmount} MRU</Text>
            </View>
          </View>

          {/* Update Status */}
          {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
            <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: 15, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '🔄 تحديث الحالة' : '🔄 Mettre à jour le statut'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {nextStatuses.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => updateStatus(selectedOrder._id, s.id)}
                    style={{ backgroundColor: s.color, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                      {s.icon} {isRTL ? s.labelAr : s.labelFr}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => updateStatus(selectedOrder._id, 'cancelled')}
                  style={{ backgroundColor: '#e74c3c', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                    ❌ {isRTL ? 'إلغاء' : 'Annuler'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Orders List View ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <TouchableOpacity
          onPress={() => { setSelectedOrder(newOrderAlert); setNewOrderAlert(null); }}
          style={{
            backgroundColor: '#FF6B35', padding: 14, flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center', justifyContent: 'space-between'
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
            🔔 {isRTL ? `طلب جديد! #${newOrderAlert.orderNumber}` : `Nouvelle commande! #${newOrderAlert.orderNumber}`}
          </Text>
          <TouchableOpacity onPress={() => setNewOrderAlert(null)}>
            <Text style={{ color: 'white', fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {/* Header */}
      <View style={{ backgroundColor: '#FF6B35', padding: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: 'white', fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 17, fontWeight: 'bold' }}>
          {isRTL ? '📦 الطلبات الواردة' : '📦 Commandes reçues'}
        </Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{activeOrders.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        {[
          { id: 'active', labelAr: 'النشطة', labelFr: 'Actives' },
          { id: 'all', labelAr: 'الكل', labelFr: 'Toutes' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === tab.id ? '#FF6B35' : 'transparent' }}
          >
            <Text style={{ fontWeight: '600', color: activeTab === tab.id ? '#FF6B35' : '#888' }}>
              {isRTL ? tab.labelAr : tab.labelFr}
              {tab.id === 'active' && activeOrders.length > 0 ? ` (${activeOrders.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayOrders}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={['#FF6B35']} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ padding: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 50 }}>📭</Text>
            <Text style={{ color: '#999', marginTop: 12, fontSize: 15, textAlign: 'center' }}>
              {isRTL ? 'لا توجد طلبات بعد' : 'Aucune commande pour l\'instant'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatus(item.status);
          const isNew = item.status === 'pending';
          return (
            <TouchableOpacity
              onPress={() => setSelectedOrder(item)}
              style={{
                backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
                borderLeftWidth: isNew ? 4 : 0, borderLeftColor: '#FF6B35',
              }}
            >
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#2C3E50' }}>
                    #{item.orderNumber}
                    {isNew && <Text style={{ color: '#FF6B35', fontSize: 12 }}> 🆕</Text>}
                  </Text>
                  <View style={{ backgroundColor: status.color + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: status.color, fontWeight: 'bold', fontSize: 12 }}>
                      {status.icon} {isRTL ? status.labelAr : status.labelFr}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 16 }}>
                  <Text style={{ color: '#888', fontSize: 13 }}>📞 {item.phoneNumber}</Text>
                  <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 13 }}>
                    {item.totalAmount} MRU
                  </Text>
                </View>

                {item.shippingAddress && (
                  <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }} numberOfLines={1}>
                    📍 {item.shippingAddress}
                  </Text>
                )}

                <Text style={{ color: '#ccc', fontSize: 11, marginTop: 6, textAlign: isRTL ? 'right' : 'left' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isRTL }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 8 }}>
      <Text style={{ color: '#888', fontSize: 13, minWidth: 80, textAlign: isRTL ? 'right' : 'left' }}>{label}:</Text>
      <Text style={{ color: '#2C3E50', fontSize: 13, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{value}</Text>
    </View>
  );
}
