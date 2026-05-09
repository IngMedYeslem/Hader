import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StatusBar, Animated, Linking, Alert, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '../translations';
import { API_CONFIG } from '../config/api';
import ShopHeader from './ShopHeader';
const BASE = API_CONFIG.BASE_URL;

const ORDER_STEPS = [
  { id: 'pending',    icon: '📋', labelAr: 'تم استلام الطلب',   labelFr: 'Commande reçue' },
  { id: 'confirmed',  icon: '✅', labelAr: 'تم تأكيد الطلب',   labelFr: 'Commande confirmée' },
  { id: 'preparing',  icon: '👨‍🍳', labelAr: 'جاري التحضير',     labelFr: 'En préparation' },
  { id: 'on_the_way', icon: '🛵', labelAr: 'في الطريق إليك',   labelFr: 'En route vers vous' },
  { id: 'delivered',  icon: '🎉', labelAr: 'تم التوصيل',        labelFr: 'Livré!' },
];

const TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed'];

export default function OrderTrackingScreen({ order, onBack, onNewOrder }) {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [liveOrder, setLiveOrder] = useState(null);
  const [newReceipt, setNewReceipt] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (ORDER_STEPS.length - 1),
      duration: 800,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [currentStep]);

  useEffect(() => {
    if (order?.orderNumber) {
      fetchOrderStatus();
      intervalRef.current = setInterval(fetchOrderStatus, 15000);
      return () => clearInterval(intervalRef.current);
    }
  }, [order]);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${BASE}/orders/number/${order.orderNumber}`);
      const data = await response.json();
      if (data && data.status) {
        setLiveOrder(data);
        const stepIndex = ORDER_STEPS.findIndex(s => s.id === data.status);
        if (stepIndex >= 0) setCurrentStep(stepIndex);
        // Stop polling when order reaches a terminal state
        if (TERMINAL_STATUSES.includes(data.status)) {
          clearInterval(intervalRef.current);
        }
      }
    } catch (e) {
      console.log('Order status fetch failed, keeping current step');
    }
  };

  const isReceiptRejected = liveOrder?.paymentMethod === 'bank' && liveOrder?.paymentStatus === 'rejected';
  const pickNewReceipt = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) setNewReceipt(file);
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) setNewReceipt(result.assets[0].uri);
  };

  const submitNewReceipt = async () => {
    if (!newReceipt || !liveOrder?._id) return;
    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        formData.append('receipt', newReceipt);
      } else {
        formData.append('receipt', { uri: newReceipt, type: 'image/jpeg', name: 'receipt.jpg' });
      }
      const uploadRes = await fetch(`${BASE}/upload-receipt`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.receiptPath) {
        await fetch(`${BASE}/orders/${liveOrder._id}/new-receipt`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptUrl: uploadData.receiptPath }),
        });
        setNewReceipt(null);
        fetchOrderStatus();
        Platform.OS === 'web'
          ? window.alert(isRTL ? 'تم إرسال الإيصال بنجاح' : 'Reçu envoyé avec succès')
          : Alert.alert(isRTL ? 'تم ✅' : 'Envoyé ✅', isRTL ? 'تم إرسال الإيصال بنجاح' : 'Reçu envoyé avec succès');
      }
    } catch (e) {
      Platform.OS === 'web'
        ? window.alert(isRTL ? 'فشل رفع الإيصال' : 'Échec de l\'envoi')
        : Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل رفع الإيصال' : 'Échec de l\'envoi');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const isCancelled = liveOrder?.status === 'cancelled' || liveOrder?.status === 'failed';
  const currentStepData = ORDER_STEPS[currentStep];
  const isDelivered = currentStep === ORDER_STEPS.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <ShopHeader onBack={onBack} showCart={false} />
      {/* Header */}
      <View style={{ backgroundColor: '#FF6B35', padding: 16, paddingBottom: 30 }}>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            {isRTL ? 'رقم الطلب' : 'N° de commande'}
          </Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 2 }}>
            #{order?.orderNumber}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {isRTL ? `الإجمالي: ${order?.total} MRU` : `Total: ${order?.total} MRU`}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -16 }}>

        {/* إيصال التحويل البنكي - في الأعلى */}
        {liveOrder?.paymentMethod === 'bank' && (
          <View style={{ backgroundColor: 'white', margin: 16, marginBottom: 0, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}>
            <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
              🧾 {isRTL ? 'إيصال التحويل البنكي' : 'Reçu de virement bancaire'}
            </Text>

            {/* سبب الرفض */}
            {liveOrder.paymentStatus === 'rejected' && liveOrder.paymentNote && (
              <View style={{ backgroundColor: '#f8d7da', borderRadius: 8, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#e74c3c' }}>
                <Text style={{ color: '#721c24', fontWeight: 'bold', fontSize: 13, textAlign: isRTL ? 'right' : 'left' }}>
                  ❌ {isRTL ? `سبب الرفض: ${liveOrder.paymentNote}` : `Motif du rejet: ${liveOrder.paymentNote}`}
                </Text>
              </View>
            )}

            {/* الإيصال: إذا مرفوض يظهر القديم مع إمكانية الاستبدال، وإلا يظهر فقط */}
            {isReceiptRejected ? (
              <TouchableOpacity
                onPress={pickNewReceipt}
                style={{ borderWidth: 2, borderColor: newReceipt ? '#2ecc71' : '#e74c3c', borderStyle: 'dashed', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}
              >
                {newReceipt ? (
                  Platform.OS === 'web'
                    ? <View style={{ padding: 16, alignItems: 'center', backgroundColor: '#f0fff4' }}>
                        <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>✅ {isRTL ? 'تم اختيار الإيصال الجديد' : 'Nouveau reçu sélectionné'}</Text>
                      </View>
                    : <View>
                        <Image source={{ uri: newReceipt }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                        <View style={{ backgroundColor: 'rgba(46,204,113,0.85)', padding: 8, alignItems: 'center' }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>✅ {isRTL ? 'اضغط للتغيير' : 'Appuyer pour changer'}</Text>
                        </View>
                      </View>
                ) : (
                  liveOrder.paymentReceiptUrl
                    ? <View>
                        <Image source={{ uri: `${BASE.replace('/api', '')}${liveOrder.paymentReceiptUrl}` }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                        <View style={{ backgroundColor: 'rgba(231,76,60,0.85)', padding: 8, alignItems: 'center' }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>📷 {isRTL ? 'اضغط لرفع إيصال جديد' : 'Appuyer pour envoyer un nouveau reçu'}</Text>
                        </View>
                      </View>
                    : <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 32 }}>📷</Text>
                        <Text style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: 6 }}>{isRTL ? 'اضغط لرفع إيصال جديد' : 'Appuyer pour envoyer un nouveau reçu'}</Text>
                      </View>
                )}
              </TouchableOpacity>
            ) : (
              liveOrder.paymentReceiptUrl
                ? <Image source={{ uri: `${BASE.replace('/api', '')}${liveOrder.paymentReceiptUrl}` }} style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 8 }} resizeMode="cover" />
                : null
            )}

            {/* زر الإرسال */}
            {isReceiptRejected && newReceipt && (
              <TouchableOpacity
                onPress={submitNewReceipt}
                disabled={uploadingReceipt}
                style={{ backgroundColor: uploadingReceipt ? '#ccc' : '#2ecc71', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                  {uploadingReceipt ? '⏳...' : (isRTL ? '✅ إرسال الإيصال الجديد' : '✅ Envoyer le nouveau reçu')}
                </Text>
              </TouchableOpacity>
            )}

            {/* حالة الإيصال */}
            {!isReceiptRejected && liveOrder.paymentStatus === 'confirmed' && (
              <View style={{ backgroundColor: '#d4edda', borderRadius: 8, padding: 10, alignItems: 'center' }}>
                <Text style={{ color: '#155724', fontWeight: 'bold' }}>✅ {isRTL ? 'تم تأكيد الدفع' : 'Paiement confirmé'}</Text>
              </View>
            )}
            {!isReceiptRejected && liveOrder.paymentStatus === 'receipt_uploaded' && (
              <View style={{ backgroundColor: '#fff3cd', borderRadius: 8, padding: 10, alignItems: 'center' }}>
                <Text style={{ color: '#856404', fontWeight: 'bold' }}>⏳ {isRTL ? 'قيد المراجعة من المتجر' : 'En attente de vérification'}</Text>
              </View>
            )}
          </View>
        )}

        {/* Current Status Card */}
        <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 }}>
          {isCancelled ? (
            <>
              <Text style={{ fontSize: 60 }}>❌</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#e74c3c', marginTop: 12, textAlign: 'center' }}>
                {isRTL ? 'تم رفض الطلب' : 'Commande refusée'}
              </Text>
              <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 }}>
                <Text style={{ color: '#c0392b', textAlign: 'center' }}>
                  {isRTL ? 'عذراً، تم رفض طلبك من قبل المتجر' : 'Désolé, votre commande a été refusée par le magasin'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Animated.Text style={{ fontSize: 60, transform: [{ scale: pulseAnim }] }}>
                {currentStepData.icon}
              </Animated.Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 12, textAlign: 'center' }}>
                {isRTL ? currentStepData.labelAr : currentStepData.labelFr}
              </Text>
              {!isDelivered && (
                <Text style={{ color: '#777', marginTop: 6, textAlign: 'center' }}>
                  {isRTL ? 'يرجى الانتظار...' : 'Veuillez patienter...'}
                </Text>
              )}
              {isDelivered && (
                <View style={{ backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 }}>
                  <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                    {isRTL ? '🎉 استمتع بطلبك!' : '🎉 Bon appétit!'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Progress Steps */}
        <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'مراحل الطلب' : 'Étapes de la commande'}
          </Text>

          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep && !isCancelled;
            const isPending = index > currentStep;

            return (
              <View key={step.id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', marginBottom: index < ORDER_STEPS.length - 1 ? 0 : 0 }}>
                {/* Icon & Line */}
                <View style={{ alignItems: 'center', marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: isCompleted ? '#FF6B35' : isCurrent ? '#FFF3EE' : '#f5f5f5',
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: '#FF6B35',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    {isCompleted ? (
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>✓</Text>
                    ) : (
                      <Text style={{ fontSize: 20 }}>{step.icon}</Text>
                    )}
                  </View>
                  {index < ORDER_STEPS.length - 1 && (
                    <View style={{ width: 2, height: 30, backgroundColor: isCompleted ? '#FF6B35' : '#eee', marginVertical: 4 }} />
                  )}
                </View>

                {/* Label */}
                <View style={{ flex: 1, paddingTop: 10, paddingBottom: index < ORDER_STEPS.length - 1 ? 30 : 0 }}>
                  <Text style={{
                    fontSize: 14, fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isPending ? '#ccc' : isCurrent ? '#FF6B35' : '#2C3E50',
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                    {isRTL ? step.labelAr : step.labelFr}
                  </Text>
                  {isCurrent && (
                    <Text style={{ fontSize: 12, color: '#FF6B35', marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? '← الحالة الحالية' : '← Statut actuel'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Info */}
        <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? '📍 معلومات التوصيل' : '📍 Informations de livraison'}
          </Text>
          <InfoRow icon="📞" label={isRTL ? 'الهاتف' : 'Téléphone'} value={order?.phone} isRTL={isRTL} />
          <InfoRow icon="🏠" label={isRTL ? 'العنوان' : 'Adresse'} value={order?.address} isRTL={isRTL} />
          <InfoRow icon="💳" label={isRTL ? 'الدفع' : 'Paiement'} value={order?.paymentMethod === 'cash' ? (isRTL ? 'عند الاستلام' : 'À la livraison') : order?.paymentMethod} isRTL={isRTL} />
        </View>

        {/* Contact Support */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+22200000000').catch(() => {})}
            style={{ backgroundColor: '#FF6B35', borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 }}
          >
            <Text style={{ fontSize: 18 }}>📞</Text>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
              {isRTL ? 'اتصل بالدعم' : 'Contacter le support'}
            </Text>
          </TouchableOpacity>

          {(isDelivered || isCancelled) && (
            <TouchableOpacity
              onPress={onNewOrder}
              style={{ backgroundColor: '#FF6B35', borderRadius: 16, padding: 14, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                {isRTL ? '🛒 طلب جديد' : '🛒 Nouvelle commande'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, isRTL }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ fontSize: 18, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}>{icon}</Text>
      <Text style={{ color: '#777', fontSize: 13, marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }}>{label}:</Text>
      <Text style={{ color: '#333', fontSize: 13, fontWeight: '500', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{value}</Text>
    </View>
  );
}
