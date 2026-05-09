import React, { useState, useEffect, useCallback, useRef, Component } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  RefreshControl, SafeAreaView, StyleSheet, Platform
} from 'react-native';
import { API_CONFIG } from '../config/api';
import { useTranslation } from '../translations';
import { STATUS_FLOW, getStatus } from './orderConstants';
import OrderDetailView from './OrderDetailView';

const BASE = API_CONFIG.BASE_URL;

export { STATUS_FLOW, getStatus };

const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed) {
        const confirmBtn = buttons.find(b => b.style === 'destructive' || b.style !== 'cancel');
        confirmBtn?.onPress?.();
      }
    } else {
      window.alert(`${title}\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};


const TABS = [
  { id: 'pending',    labelAr: 'معلق',        labelFr: 'En attente' },
  { id: 'confirmed',  labelAr: 'مؤكد',        labelFr: 'Confirmé' },
  { id: 'preparing',  labelAr: 'قيد التحضير', labelFr: 'Préparation' },
  { id: 'on_the_way', labelAr: 'في الطريق',   labelFr: 'En route' },
  { id: 'delivered',  labelAr: 'تم التوصيل',  labelFr: 'Livré' },
  { id: 'cancelled',  labelAr: 'ملغي',        labelFr: 'Annulé' },
];


class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#e74c3c', marginBottom: 10 }}>⚠️ خطأ في عرض الطلب</Text>
          <Text style={{ color: '#777', fontSize: 12, textAlign: 'center' }}>{String(this.state.error)}</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false })} style={{ marginTop: 20, backgroundColor: '#FF6B35', padding: 12, borderRadius: 10 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>رجوع</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function ShopOrderManagement({ shopId, onClose, onSelectOrder }) {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const prevOrderIds = useRef(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${BASE}/shops/${shopId}/orders`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.orders || []);
        if (prevOrderIds.current.size > 0) {
          const newOnes = list.filter(o => !prevOrderIds.current.has(o._id) && o.status === 'pending');
          if (newOnes.length > 0) {
            if (Platform.OS !== "web") { const { Vibration } = require("react-native"); Vibration.vibrate([0, 400, 200, 400]); }
            setNewOrderAlert(newOnes[0]);
          }
        }
        prevOrderIds.current = new Set(list.map(o => o._id));
        setOrders(list);
      }
    } catch (e) {
      console.log('Orders fetch error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const acceptOrder = async (orderId) => {
    if (loadingOrderId) return;
    setLoadingOrderId(orderId);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed', shopId: shopId?.toString() || shopId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'confirmed' } : o));
        showAlert(isRTL ? 'تم القبول ✅' : 'Accepté ✅', isRTL ? 'تم قبول الطلب' : 'Commande acceptée');
      } else {
        showAlert(isRTL ? 'خطأ' : 'Erreur', data.error || (isRTL ? 'فشل تحديث الحالة' : 'Mise à jour échouée'));
      }
    } catch (e) {
      clearTimeout(timeout);
      const msg = e.name === 'AbortError'
        ? (isRTL ? 'انتهت مهلة الاتصال، تحقق من الشبكة' : 'Délai dépassé, vérifiez le réseau')
        : (isRTL ? `تعذر الاتصال بالخادم\n${BASE}` : `Impossible de joindre le serveur\n${BASE}`);
      showAlert(isRTL ? 'خطأ في الاتصال' : 'Erreur réseau', msg);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const rejectOrder = (orderId) => {
    showAlert(
      isRTL ? 'رفض الطلب' : 'Refuser',
      isRTL ? 'هل تريد رفض هذه الطلبية؟' : 'Voulez-vous refuser cette commande?',
      [
        { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
        { text: isRTL ? 'رفض' : 'Refuser', style: 'destructive', onPress: () => updateStatus(orderId, 'cancelled') },
      ]
    );
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, shopId: shopId?.toString() || shopId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        Alert.alert(isRTL ? 'خطأ' : 'Erreur', data.error || (isRTL ? 'فشل تحديث الحالة' : 'Mise à jour échouée'));
      }
    } catch (e) {
      showAlert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل تحديث الحالة' : 'Mise à jour échouée');
    }
  };

  const tabOrders = orders.filter(o => o.status === activeTab);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // ── Detail View ──
  if (selectedOrder) {
    return (
      <ErrorBoundary><OrderDetailView
        order={selectedOrder}
        shopId={shopId}
        onBack={() => setSelectedOrder(null)}
        onOrderUpdated={(updated) => {
          setSelectedOrder(updated);
          setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        }}
      />
      </ErrorBoundary>
    );
  }

  return (
    <SafeAreaView style={s.container}>

      {/* ── New Order Alert Banner ── */}
      {newOrderAlert && (
        <TouchableOpacity
          style={s.alertBanner}
          onPress={() => { setSelectedOrder(newOrderAlert); setNewOrderAlert(null); }}
        >
          <Text style={s.alertText}>
            🔔 {isRTL ? `طلب جديد! #${newOrderAlert.orderNumber}` : `Nouvelle commande! #${newOrderAlert.orderNumber}`}
          </Text>
          <TouchableOpacity onPress={() => setNewOrderAlert(null)}>
            <Text style={s.alertClose}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* ── Header ── */}
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={onClose}>
          <Text style={s.headerBack}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {isRTL ? '📦 إدارة الطلبات' : '📦 Gestion des commandes'}
        </Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{pendingCount}</Text>
        </View>
      </View>

      {/* ── 6 Tabs ── */}
      <View style={s.tabsWrapper}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={t => t.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
          renderItem={({ item: tab }) => {
            const st = getStatus(tab.id);
            const count = orders.filter(o => o.status === tab.id).length;
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(tab.id)}
                style={[s.tab, active && { borderBottomColor: st.color, borderBottomWidth: 3 }]}
              >
                <Text style={s.tabIcon}>{st.icon}</Text>
                <Text style={[s.tabLabel, { color: active ? st.color : '#888' }]}>
                  {isRTL ? tab.labelAr : tab.labelFr}
                </Text>
                {count > 0 && (
                  <View style={[s.tabBadge, { backgroundColor: st.color }]}>
                    <Text style={s.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Orders List ── */}
      <FlatList
        data={tabOrders}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>
              {isRTL ? 'لا توجد طلبات في هذه الفئة' : 'Aucune commande dans cette catégorie'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = getStatus(item.status);
          return (
            <TouchableOpacity style={[s.card, item.status === 'pending' && s.cardNew]} onPress={() => setSelectedOrder(item)}>

              {/* Card Header */}
              <View style={[s.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={s.cardNumber}>
                  #{item.orderNumber}
                  {item.status === 'pending' && <Text style={s.newTag}> 🆕</Text>}
                </Text>
                <View style={[s.statusPill, { backgroundColor: st.color + '22' }]}>
                  <Text style={[s.statusPillText, { color: st.color }]}>
                    {st.icon} {isRTL ? st.labelAr : st.labelFr}
                  </Text>
                </View>
              </View>

              {/* Card Info */}
              <View style={[s.cardInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={s.cardPhone}>📞 {item.phoneNumber}</Text>
                <Text style={s.cardAmount}>{item.totalAmount} MRU</Text>
              </View>

              {item.shippingAddress ? (
                <Text style={[s.cardAddress, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                  📍 {item.shippingAddress}
                </Text>
              ) : null}

              <Text style={[s.cardDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                🕐 {new Date(item.createdAt).toLocaleString()}
              </Text>

              {/* Quick Actions for pending */}
              {item.status === 'pending' && (
                <View style={s.quickActions}>
                  <TouchableOpacity
                    style={[s.btnAccept, loadingOrderId === item._id && { opacity: 0.6 }]}
                    onPress={() => acceptOrder(item._id)}
                    disabled={!!loadingOrderId}
                  >
                    <Text style={s.btnText}>
                      {loadingOrderId === item._id ? '⏳' : '✅'} {isRTL ? 'قبول' : 'Accepter'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnReject} onPress={() => rejectOrder(item._id)}>
                    <Text style={s.btnText}>❌ {isRTL ? 'رفض' : 'Refuser'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f6fa' },
  // Alert
  alertBanner:    { backgroundColor: '#FF6B35', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertText:      { color: 'white', fontWeight: 'bold', fontSize: 14, flex: 1 },
  alertClose:     { color: 'white', fontSize: 22, paddingHorizontal: 8 },
  // Header
  header:         { backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'space-between' },
  headerBack:     { color: 'white', fontSize: 22, paddingRight: 8 },
  headerTitle:    { color: 'white', fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  badge:          { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText:      { color: 'white', fontWeight: 'bold', fontSize: 13 },
  // Tabs
  tabsWrapper:    { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabsContent:    { paddingHorizontal: 8 },
  tab:            { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent', marginHorizontal: 2 },
  tabIcon:        { fontSize: 18 },
  tabLabel:       { fontSize: 11, fontWeight: '600', marginTop: 2 },
  tabBadge:       { borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  tabBadgeText:   { color: 'white', fontSize: 10, fontWeight: 'bold' },
  // List
  listContent:    { padding: 14, paddingBottom: 40 },
  empty:          { paddingVertical: 60, alignItems: 'center' },
  emptyIcon:      { fontSize: 52 },
  emptyText:      { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center' },
  // Card
  card:           { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardNew:        { borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  cardHeader:     { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardNumber:     { fontWeight: 'bold', fontSize: 15, color: '#333' },
  newTag:         { color: '#FF6B35', fontSize: 12 },
  statusPill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontWeight: 'bold', fontSize: 12 },
  cardInfo:       { justifyContent: 'space-between', marginBottom: 4 },
  cardPhone:      { color: '#777', fontSize: 13 },
  cardAmount:     { color: '#FF6B35', fontWeight: 'bold', fontSize: 13 },
  cardAddress:    { color: '#aaa', fontSize: 12, marginTop: 2 },
  cardDate:       { color: '#ccc', fontSize: 11, marginTop: 4 },
  // Quick Actions
  quickActions:   { flexDirection: 'row', marginTop: 10 },
  btnAccept:      { flex: 1, backgroundColor: '#2ecc71', padding: 10, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  btnReject:      { flex: 1, backgroundColor: '#e74c3c', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnText:        { color: 'white', fontWeight: 'bold', fontSize: 13 },
});
