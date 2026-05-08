import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Alert, SafeAreaView, StyleSheet
} from 'react-native';
import { API_CONFIG } from '../config/api';
import { useTranslation } from '../translations';
import { STATUS_FLOW, getStatus } from './orderConstants';

const BASE = API_CONFIG.BASE_URL;

// Timeline steps in order (excluding cancelled)
const TIMELINE_STEPS = STATUS_FLOW
  ? ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered'].map(id => STATUS_FLOW.find(s => s.id === id)).filter(Boolean)
  : [];

export default function OrderDetailView({ order, shopId, onBack, onOrderUpdated }) {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const status = getStatus(order?.status) || getStatus("pending");

  const updateStatus = async (newStatus) => {
    try {
      const orderId = order._id?.toString() || order._id;
      const res = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, shopId: shopId?.toString() || shopId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onOrderUpdated({ ...order, status: newStatus });
      } else {
        Alert.alert(
          isRTL ? 'خطأ' : 'Erreur',
          data.error || (isRTL ? 'فشل تحديث الحالة' : 'Mise à jour échouée')
        );
      }
    } catch (e) {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'تحقق من الاتصال' : 'Vérifiez votre connexion');
    }
  };

  const confirmPayment = async (paymentStatus) => {
    try {
      const orderId = order._id?.toString() || order._id;
      const res = await fetch(`${BASE}/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (res.ok) onOrderUpdated({ ...order, paymentStatus });
      else Alert.alert(isRTL ? 'خطأ' : 'Erreur', data.error || (isRTL ? 'فشل التحديث' : 'Mise à jour échouée'));
    } catch (e) {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'تحقق من الاتصال' : 'Vérifiez votre connexion');
    }
  };

  const acceptOrder = () => {
    Alert.alert(
      isRTL ? 'قبول الطلب' : 'Accepter la commande',
      isRTL ? 'هل تريد قبول هذه الطلبية؟' : 'Voulez-vous accepter cette commande?',
      [
        { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
        { text: isRTL ? 'قبول' : 'Accepter', onPress: () => updateStatus('confirmed') },
      ]
    );
  };

  const rejectOrder = () => {
    Alert.alert(
      isRTL ? 'رفض الطلب' : 'Refuser la commande',
      isRTL ? 'هل تريد رفض هذه الطلبية؟' : 'Voulez-vous refuser cette commande?',
      [
        { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
        { text: isRTL ? 'رفض' : 'Refuser', style: 'destructive', onPress: () => updateStatus('cancelled') },
      ]
    );
  };

  // Next possible statuses (forward flow only, no pending/cancelled)
  // Only the immediate next status (not all future ones)
  const currentIdx = STATUS_FLOW.findIndex(x => x.id === order.status);
  const nextStatuses = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? [STATUS_FLOW[currentIdx + 1]].filter(s => s && s.id !== 'cancelled')
    : [];

  const isDone = ['delivered', 'cancelled'].includes(order.status);

  return (
    <SafeAreaView style={s.container}>

      {/* ── Header ── */}
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>#{order.orderNumber}</Text>
          <Text style={s.headerSub}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
        <View style={[s.headerStatusPill, { backgroundColor: status.color }]}>
          <Text style={s.headerStatusText}>{status.icon}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll}>

        {/* ── Timeline ── */}
        <View style={s.card}>
          <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? '🗺️ مسار الطلب' : '🗺️ Suivi de commande'}
          </Text>
          <View style={s.timeline}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isCancelled = order.status === 'cancelled';
              const currentIdx = isCancelled ? -1 : TIMELINE_STEPS.findIndex(x => x.id === order.status);
              const isDone    = !isCancelled && currentIdx > -1 && idx < currentIdx;
              const isActive  = !isCancelled && currentIdx > -1 && idx === currentIdx;
              const isPending = isCancelled || currentIdx === -1 || idx > currentIdx;
              const isLast = idx === TIMELINE_STEPS.length - 1;

              return (
                <View key={step.id} style={[s.timelineRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {/* Line + Dot */}
                  <View style={s.timelineDotCol}>
                    {idx > 0 && (
                      <View style={[s.timelineLine, { backgroundColor: isDone || isActive ? step.color : '#e0e0e0' }]} />
                    )}
                    <View style={[
                      s.timelineDot,
                      isDone  && { backgroundColor: step.color, borderColor: step.color },
                      isActive && { backgroundColor: step.color, borderColor: step.color, width: 38, height: 38, borderRadius: 19 },
                      isPending && { backgroundColor: 'white', borderColor: '#ddd' },
                    ]}>
                      <Text style={s.timelineDotIcon}>{isDone || isActive ? step.icon : '○'}</Text>
                    </View>
                    {!isLast && (
                      <View style={[s.timelineLine, { backgroundColor: isDone ? step.color : '#e0e0e0' }]} />
                    )}
                  </View>
                  {/* Label */}
                  <View style={[s.timelineLabel, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[
                      s.timelineLabelText,
                      isActive && { color: step.color, fontWeight: 'bold' },
                      isPending && { color: '#bbb' },
                      isDone && { color: '#555' },
                    ]}>
                      {isRTL ? step.labelAr : step.labelFr}
                    </Text>
                    {isActive && (
                      <View style={[s.activePill, { backgroundColor: step.color + '22' }]}>
                        <Text style={[s.activePillText, { color: step.color }]}>
                          {isRTL ? 'الحالة الحالية' : 'Statut actuel'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Cancelled step */}
            {order.status === 'cancelled' && (
              <View style={[s.cancelledRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={s.cancelledIcon}>❌</Text>
                <Text style={s.cancelledText}>{isRTL ? 'تم إلغاء الطلب' : 'Commande annulée'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Customer Info ── */}
        <View style={s.card}>
          <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? '👤 معلومات العميل' : '👤 Informations client'}
          </Text>
          <InfoRow label={isRTL ? 'الهاتف' : 'Téléphone'} value={order.phoneNumber} isRTL={isRTL} />
          <InfoRow label={isRTL ? 'العنوان' : 'Adresse'} value={order.shippingAddress} isRTL={isRTL} />
          <InfoRow
            label={isRTL ? 'الدفع' : 'Paiement'}
            value={order.paymentMethod === 'cash'
              ? (isRTL ? 'نقداً عند الاستلام' : 'Espèces à la livraison')
              : (isRTL ? 'تحويل بنكي' : 'Virement bancaire')}
            isRTL={isRTL}
          />
        </View>

        {/* ── Bank Receipt ── */}
        {order.paymentMethod === 'bank' && (
          <View style={s.card}>
            <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '🧾 إيصال التحويل البنكي' : '🧾 Reçu de virement'}
            </Text>
            {order.paymentReceiptUrl ? (
              <>
                <Image
                  source={{ uri: `${BASE.replace('/api', '')}${order.paymentReceiptUrl}` }}
                  style={s.receiptImage}
                  resizeMode="contain"
                />
                {order.paymentStatus === 'receipt_uploaded' && (
                  <View style={s.row}>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#2ecc71' }]} onPress={() => confirmPayment('confirmed')}>
                      <Text style={s.btnText}>✅ {isRTL ? 'تأكيد الدفع' : 'Confirmer'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#e74c3c' }]} onPress={() => confirmPayment('rejected')}>
                      <Text style={s.btnText}>❌ {isRTL ? 'رفض الإيصال' : 'Rejeter'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {order.paymentStatus === 'confirmed' && (
                  <View style={[s.paymentBadge, { backgroundColor: '#d4edda' }]}>
                    <Text style={{ color: '#155724', fontWeight: 'bold' }}>
                      ✅ {isRTL ? 'تم تأكيد الدفع' : 'Paiement confirmé'}
                    </Text>
                  </View>
                )}
                {order.paymentStatus === 'rejected' && (
                  <View style={[s.paymentBadge, { backgroundColor: '#f8d7da' }]}>
                    <Text style={{ color: '#721c24', fontWeight: 'bold' }}>
                      ❌ {isRTL ? 'تم رفض الإيصال' : 'Reçu rejeté'}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={s.waitingReceipt}>
                <Text style={{ color: '#FF6B35', textAlign: 'center' }}>
                  ⏳ {isRTL ? 'في انتظار رفع الإيصال من الزبون' : 'En attente du reçu du client'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Order Items ── */}
        <View style={s.card}>
          <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? '🛒 المنتجات' : '🛒 Produits'}
          </Text>
          {(order.items || []).map((item, i) => (
            <View
              key={i}
              style={[s.itemRow, { flexDirection: isRTL ? 'row-reverse' : 'row' },
                i < order.items.length - 1 && s.itemBorder]}
            >
              <Text style={[s.itemName, { textAlign: isRTL ? 'right' : 'left' }]}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={s.itemPrice}>{((item.price || 0) * item.quantity)} MRU</Text>
            </View>
          ))}
          <View style={[s.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={s.totalLabel}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
            <Text style={s.totalAmount}>{order.totalAmount} MRU</Text>
          </View>
        </View>

        {/* ── Accept / Reject (pending only) ── */}
        {order.status === 'pending' && (
          <View style={s.card}>
            <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '❓ هل تقبل هذه الطلبية؟' : '❓ Accepter cette commande?'}
            </Text>
            <View style={s.row}>
              <TouchableOpacity style={[s.btn, { backgroundColor: '#2ecc71' }]} onPress={acceptOrder}>
                <Text style={s.btnText}>✅ {isRTL ? 'قبول الطلب' : 'Accepter'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { backgroundColor: '#e74c3c' }]} onPress={rejectOrder}>
                <Text style={s.btnText}>❌ {isRTL ? 'رفض الطلب' : 'Refuser'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Update Status ── */}
        {!isDone && order.status !== 'pending' && nextStatuses.length > 0 && (
          <View style={[s.card, { marginBottom: 32 }]}>
            <Text style={[s.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '🔄 تحديث الحالة' : '🔄 Mettre à jour le statut'}
            </Text>
            <View style={s.statusBtns}>
              {nextStatuses.map(st => (
                <TouchableOpacity
                  key={st.id}
                  style={[s.statusBtn, { backgroundColor: st.color }]}
                  onPress={() => updateStatus(st.id)}
                >
                  <Text style={s.statusBtnText}>{st.icon} {isRTL ? st.labelAr : st.labelFr}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.statusBtn, { backgroundColor: '#e74c3c' }]}
                onPress={rejectOrder}
              >
                <Text style={s.statusBtnText}>❌ {isRTL ? 'إلغاء الطلب' : 'Annuler'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isRTL }) {
  if (!value) return null;
  return (
    <View style={[s.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={s.infoLabel}>{label}:</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6fa' },
  scroll:           { padding: 14, paddingBottom: 40 },
  // Header
  header:           { backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'space-between' },
  backBtn:          { padding: 4 },
  backText:         { color: 'white', fontSize: 22 },
  headerTitle:      { color: 'white', fontSize: 17, fontWeight: 'bold' },
  headerSub:        { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  headerStatusPill: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerStatusText: { fontSize: 18 },
  // Card
  card:             { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  sectionTitle:     { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 14 },
  // Timeline
  timeline:         { paddingHorizontal: 8 },
  timelineRow:      { alignItems: 'flex-start', marginBottom: 0 },
  timelineDotCol:   { alignItems: 'center', width: 36 },
  timelineLine:     { width: 2, height: 20, marginVertical: 0 },
  timelineDot:      { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotIcon:  { fontSize: 14 },
  timelineLabel:    { flex: 1, paddingHorizontal: 12, paddingVertical: 4, justifyContent: 'center' },
  timelineLabelText:{ fontSize: 14, color: '#555' },
  activePill:       { marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
  activePillText:   { fontSize: 11, fontWeight: '600' },
  cancelledRow:     { alignItems: 'center', marginTop: 8, flexDirection: 'row' },
  cancelledIcon:    { fontSize: 20, marginRight: 8 },
  cancelledText:    { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
  // Info
  infoRow:          { marginBottom: 8 },
  infoLabel:        { color: '#999', fontSize: 13, minWidth: 90 },
  infoValue:        { color: '#333', fontSize: 13, flex: 1 },
  // Receipt
  receiptImage:     { width: '100%', height: 220, borderRadius: 10, marginBottom: 12 },
  waitingReceipt:   { backgroundColor: '#fff3ee', padding: 12, borderRadius: 8 },
  paymentBadge:     { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  // Items
  itemRow:          { justifyContent: 'space-between', paddingVertical: 8 },
  itemBorder:       { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemName:         { color: '#555', flex: 1, fontSize: 13 },
  itemPrice:        { fontWeight: '600', color: '#FF6B35', fontSize: 13 },
  totalRow:         { justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel:       { fontWeight: 'bold', fontSize: 16, color: '#333' },
  totalAmount:      { fontWeight: 'bold', fontSize: 16, color: '#FF6B35' },
  // Buttons
  row:              { flexDirection: 'row' },
  btn:              { flex: 1, padding: 13, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  btnText:          { color: 'white', fontWeight: 'bold', fontSize: 14 },
  statusBtns:       { flexDirection: 'row', flexWrap: 'wrap' },
  statusBtn:        { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  statusBtnText:    { color: 'white', fontWeight: 'bold', fontSize: 13 },
});
