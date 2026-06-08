import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, Image,
  Clipboard, Platform, Modal, Linking,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../translations';
import { API_URL, API_CONFIG } from '../config/api';
import ShopHeader from './ShopHeader';
import { saveLastOrder } from '../hooks/useLastOrder';

const BASE = API_CONFIG.BASE_URL;

const PAYMENT_METHODS = [
  { id: 'cash', label: 'الدفع عند الاستلام', labelFr: 'Paiement à la livraison', icon: '💵' },
  { id: 'bank', label: 'تحويل بنكي',          labelFr: 'Virement bancaire',        icon: '🏦' },
];

// ─── بناء رسالة واتساب ────────────────────────────────────────────────────────
const buildWhatsAppMessage = ({ shopName, cartItems, total, deliveryFee, name, phone, address, notes, paymentMethod, isRTL }) => {
  const payLabel = paymentMethod === 'cash'
    ? (isRTL ? 'الدفع عند الاستلام' : 'Paiement à la livraison')
    : (isRTL ? 'تحويل بنكي' : 'Virement bancaire');

  const itemLines = cartItems
    .map(i => `  - ${i.name} × ${i.quantity}  →  ${i.price * i.quantity} MRU`)
    .join('\n');

  if (isRTL) {
    return (
      `🛍️ *طلب جديد — تطبيق حاضر*\n\n` +
      `🏪 المتجر: ${shopName}\n\n` +
      `🛒 *المنتجات:*\n${itemLines}\n\n` +
      `🚚 رسوم التوصيل: ${deliveryFee} MRU\n` +
      `💰 *الإجمالي: ${total} MRU*\n` +
      `💳 الدفع: ${payLabel}\n\n` +
      `👤 الاسم: ${name || '—'}\n` +
      `📞 الهاتف: ${phone}\n` +
      `📍 العنوان: ${address}\n` +
      (notes ? `📝 ملاحظات: ${notes}\n` : '') +
      `\n✅ أرجو تأكيد جاهزية الطلب وموعد التوصيل.`
    );
  }
  return (
    `🛍️ *Nouvelle commande — App Hadir*\n\n` +
    `🏪 Boutique: ${shopName}\n\n` +
    `🛒 *Articles:*\n${itemLines}\n\n` +
    `🚚 Livraison: ${deliveryFee} MRU\n` +
    `💰 *Total: ${total} MRU*\n` +
    `💳 Paiement: ${payLabel}\n\n` +
    `👤 Nom: ${name || '—'}\n` +
    `📞 Tél: ${phone}\n` +
    `📍 Adresse: ${address}\n` +
    (notes ? `📝 Notes: ${notes}\n` : '') +
    `\n✅ Merci de confirmer la disponibilité et l'heure de livraison.`
  );
};

// ─── فتح واتساب ───────────────────────────────────────────────────────────────
const openWhatsApp = async (whatsapp, message) => {
  const clean = (whatsapp || '').replace(/\D/g, '');
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('واتساب', 'تعذّر فتح واتساب. تأكد من تثبيت التطبيق.');
    }
  } catch (e) {
    await Linking.openURL(url).catch(() =>
      Alert.alert('خطأ', 'تعذّر فتح واتساب.')
    );
  }
};

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function CheckoutScreen({ onBack, onOrderPlaced }) {
  const { cartItems, cartShop, getTotalAmount, clearCart, deliveryAddress, deliveryPhone, setDeliveryAddress, setDeliveryPhone } = useCart();
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';

  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState(deliveryPhone || '');
  const [address, setAddress]   = useState(deliveryAddress || '');
  const [notes, setNotes]       = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading]   = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading]   = useState(false);

  // مرحلة واتساب
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappSent, setWhatsappSent]           = useState(false);

  const deliveryFee = 15;
  const total   = getTotalAmount() + deliveryFee;
  const shopId  = cartShop?._id?.toString() || cartShop?.id?.toString();
  const shopWA  = cartShop?.whatsapp || cartShop?.phone || '';
  const shopName = cartShop?.name || cartShop?.username || '';

  useEffect(() => { fetchGpsLocation(); }, []);

  const fetchGpsLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      console.log('GPS error:', e);
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    if (cartShop?.bankAccounts?.length > 0) { setBankAccounts(cartShop.bankAccounts); return; }
    fetch(`${BASE}/shops/${shopId}/bank-accounts`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setBankAccounts(data))
      .catch(() => {});
  }, [shopId]);

  const pickReceiptImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'يجب السماح بالوصول للصور' : 'Permission requise');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) setReceiptImage(result.assets[0].uri);
  };

  const uploadReceipt = async (orderId, imageUri) => {
    setUploadingReceipt(true);
    try {
      const { uploadFileAsJson } = require('../services/uploadService');
      const uploadData = await uploadFileAsJson(imageUri, 'upload-receipt');
      if (uploadData?.receiptPath) {
        await fetch(`${BASE}/orders/${orderId}/receipt`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptUrl: uploadData.receiptPath }),
        });
      }
    } catch (e) {
      console.log('Receipt upload error:', e);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // ── خطوة 1: التحقق من النموذج ثم عرض مودال واتساب ─────────────────────────
  const handlePressConfirm = () => {
    if (!phone.trim() || !address.trim()) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى ملء رقم الهاتف والعنوان' : 'Veuillez remplir le téléphone et l\'adresse'
      );
      return;
    }
    // فتح مودال واتساب (الإيصال يُرفع بعد التواصل)
    setWhatsappSent(false);
    setShowWhatsAppModal(true);
  };

  // ── خطوة 2: إرسال الطلب الفعلي بعد التواصل عبر واتساب ──────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // تحقق من الإيصال هنا (بعد واتساب)
      if (paymentMethod === 'bank' && !receiptImage) {
        Alert.alert(
          isRTL ? 'مطلوب' : 'Requis',
          isRTL ? 'يرجى رفع صورة إيصال التحويل البنكي' : 'Veuillez joindre le reçu de virement'
        );
        setLoading(false);
        return;
      }

      setDeliveryPhone(phone);
      setDeliveryAddress(address);

      const finalShopId = shopId || cartItems[0]?.shopId;
      if (!finalShopId) {
        Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'لم يتم تحديد المتجر' : 'Boutique non identifiée');
        setLoading(false);
        return;
      }

      const orderData = {
        phoneNumber: phone,
        shippingAddress: address,
        customerName: name,
        notes,
        paymentMethod,
        shopId: finalShopId,
        deviceId: 'app-user',
        gpsLocation: gpsLocation || undefined,
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        totalAmount: total,
        deliveryFee,
      };

      const response = await fetch(`${BASE}/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();

      if (!data.success) {
        Alert.alert(isRTL ? 'خطأ' : 'Erreur', data.error || (isRTL ? 'فشل إنشاء الطلب' : 'Impossible de créer la commande'));
        setLoading(false);
        return;
      }

      if (paymentMethod === 'bank' && receiptImage && data.orderId) {
        await uploadReceipt(data.orderId, receiptImage);
      }

      const orderObj = { _id: data.orderId, orderNumber: data.orderNumber, phone, address, total, paymentMethod, customerName: name };
      await saveLastOrder(orderObj);
      clearCart();
      setShowWhatsAppModal(false);
      onOrderPlaced(orderObj);
    } catch {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل إنشاء الطلب' : 'Impossible de créer la commande');
    } finally {
      setLoading(false);
    }
  };

  // ── مودال واتساب ────────────────────────────────────────────────────────────
  const whatsAppMessage = buildWhatsAppMessage({
    shopName, cartItems, total, deliveryFee, name, phone, address, notes, paymentMethod, isRTL,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ShopHeader onBack={onBack} showCart={false} />

      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
          {isRTL ? 'إتمام الطلب' : 'Finaliser la commande'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* معلومات التوصيل */}
        <SectionCard title={isRTL ? '📍 معلومات التوصيل' : '📍 Informations de livraison'} isRTL={isRTL}>
          <InputField placeholder={isRTL ? 'الاسم الكامل (اختياري)' : 'Nom complet (optionnel)'} value={name} onChangeText={setName} isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'رقم الهاتف *' : 'Numéro de téléphone *'} value={phone} onChangeText={setPhone} keyboardType="phone-pad" isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'عنوان التوصيل *' : 'Adresse de livraison *'} value={address} onChangeText={setAddress} multiline isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'ملاحظات للمتجر (اختياري)' : 'Notes pour le restaurant (optionnel)'} value={notes} onChangeText={setNotes} multiline isRTL={isRTL} />

          <TouchableOpacity
            onPress={fetchGpsLocation}
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8,
              padding: 10, borderRadius: 10, marginTop: 4,
              backgroundColor: gpsLocation ? '#f0fff4' : '#fff8f5',
              borderWidth: 1, borderColor: gpsLocation ? '#2ecc71' : '#FFD4C2',
            }}
          >
            {gpsLoading ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={{ fontSize: 18 }}>{gpsLocation ? '📍' : '🔍'}</Text>}
            <Text style={{ flex: 1, fontSize: 13, color: gpsLocation ? '#27ae60' : '#FF6B35', textAlign: isRTL ? 'right' : 'left' }}>
              {gpsLoading
                ? (isRTL ? 'جاري تحديد الموقع...' : 'Localisation en cours...')
                : gpsLocation
                ? (isRTL ? `✅ تم تحديد الموقع (${gpsLocation.latitude.toFixed(4)}, ${gpsLocation.longitude.toFixed(4)})` : `✅ Position détectée`)
                : (isRTL ? 'اضغط لتحديد موقعك تلقائياً' : 'Appuyer pour détecter votre position')}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* طريقة الدفع */}
        <SectionCard title={isRTL ? '💳 طريقة الدفع' : '💳 Mode de paiement'} isRTL={isRTL}>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center',
                padding: 14, borderRadius: 12, marginBottom: 8,
                backgroundColor: paymentMethod === method.id ? '#FFF3EE' : '#f9f9f9',
                borderWidth: 2, borderColor: paymentMethod === method.id ? '#FF6B35' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 24, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>{method.icon}</Text>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? method.label : method.labelFr}
              </Text>
              {paymentMethod === method.id && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* ملخص الطلب */}
        <SectionCard title={isRTL ? '🧾 ملخص الطلب' : '🧾 Récapitulatif'} isRTL={isRTL}>
          {cartItems.map(item => (
            <View key={item._id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{item.name} × {item.quantity}</Text>
              <Text style={{ fontWeight: '600', color: '#333' }}>{item.price * item.quantity} MRU</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#777' }}>{isRTL ? 'رسوم التوصيل' : 'Livraison'}</Text>
            <Text style={{ color: '#333' }}>{deliveryFee} MRU</Text>
          </View>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FF6B35' }}>{total} MRU</Text>
          </View>
        </SectionCard>

      </ScrollView>

      {/* زر التأكيد */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TouchableOpacity
          onPress={handlePressConfirm}
          style={{ backgroundColor: '#FF6B35', borderRadius: 16, padding: 16, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isRTL ? `متابعة الطلب • ${total} MRU` : `Continuer • ${total} MRU`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── مودال واتساب ─────────────────────────────────────────────────────── */}
      <Modal visible={showWhatsAppModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 }}>

            {/* رأس المودال */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
            </View>

            <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
              <Text style={{ fontSize: 22 }}>📲</Text>
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginTop: 8, textAlign: 'center' }}>
                {isRTL ? 'تواصل مع المتجر أولاً' : 'Contactez la boutique d\'abord'}
              </Text>
              <Text style={{ fontSize: 13, color: '#777', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                {isRTL
                  ? 'أرسل طلبك للمتجر عبر واتساب حتى يتأكد من جاهزية المنتجات وموعد التوصيل، ثم أكّد طلبك.'
                  : 'Envoyez votre commande via WhatsApp pour que la boutique confirme la disponibilité et l\'heure de livraison.'}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ padding: 20 }}>

              {/* معلومات المتجر */}
              <View style={{ backgroundColor: '#f8f8f8', borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22 }}>🏪</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 15, textAlign: isRTL ? 'right' : 'left' }}>{shopName}</Text>
                  {shopWA ? (
                    <Text style={{ color: '#25D366', fontSize: 14, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                      📞 {shopWA}
                    </Text>
                  ) : (
                    <Text style={{ color: '#e74c3c', fontSize: 13, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? '⚠️ لا يوجد رقم واتساب للمتجر' : '⚠️ Pas de WhatsApp disponible'}
                    </Text>
                  )}
                </View>
              </View>

              {/* ملخص الطلب */}
              <View style={{ backgroundColor: '#fff8f5', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FFD4C2' }}>
                <Text style={{ fontWeight: 'bold', color: '#FF6B35', marginBottom: 10, textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? '🧾 تفاصيل الطلب' : '🧾 Détails de la commande'}
                </Text>
                {cartItems.map(item => (
                  <View key={item._id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left', fontSize: 13 }}>{item.name} × {item.quantity}</Text>
                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '600' }}>{item.price * item.quantity} MRU</Text>
                  </View>
                ))}
                <View style={{ height: 1, backgroundColor: '#FFD4C2', marginVertical: 8 }} />
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: 'bold', color: '#FF6B35', fontSize: 15 }}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={{ fontWeight: 'bold', color: '#FF6B35', fontSize: 15 }}>{total} MRU</Text>
                </View>
              </View>

            </ScrollView>

            <View style={{ paddingHorizontal: 20, gap: 10, paddingTop: 8 }}>

              {/* ── زر واتساب (دائماً ظاهر) ── */}
              {shopWA ? (
                <TouchableOpacity
                  onPress={() => {
                    setWhatsappSent(true);
                    openWhatsApp(shopWA, whatsAppMessage);
                  }}
                  style={{
                    backgroundColor: whatsappSent ? '#1aab55' : '#25D366',
                    borderRadius: 14, padding: 15,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>💬</Text>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {whatsappSent
                      ? (isRTL ? '✅ تم الإرسال — أعد الإرسال' : '✅ Envoyé — Renvoyer')
                      : (isRTL ? 'إرسال الطلب عبر واتساب' : 'Envoyer via WhatsApp')}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* ── قسم الحسابات البنكية والإيصال (يظهر بعد واتساب فقط) ── */}
              {whatsappSent && paymentMethod === 'bank' && (
                <View style={{ backgroundColor: '#f0f7ff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3498db' }}>
                  <Text style={{ fontWeight: 'bold', color: '#3498db', marginBottom: 10, textAlign: isRTL ? 'right' : 'left', fontSize: 14 }}>
                    {isRTL ? '🏦 أرقام الحسابات البنكية' : '🏦 Comptes bancaires'}
                  </Text>

                  {bankAccounts.length === 0 ? (
                    <Text style={{ color: '#777', textAlign: 'center', padding: 6, fontSize: 13 }}>
                      {isRTL ? 'لا توجد حسابات بنكية متاحة' : 'Aucun compte bancaire disponible'}
                    </Text>
                  ) : bankAccounts.map((acc, i) => <BankAccountCard key={i} acc={acc} isRTL={isRTL} />)}

                  {/* رفع الإيصال */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: isRTL ? 'right' : 'left', fontSize: 13 }}>
                      {isRTL ? '📎 صورة إيصال التحويل *' : '📎 Reçu de virement *'}
                    </Text>
                    <TouchableOpacity
                      onPress={pickReceiptImage}
                      style={{
                        borderWidth: 2,
                        borderColor: receiptImage ? '#2ecc71' : '#3498db',
                        borderStyle: 'dashed', borderRadius: 12, padding: 14,
                        alignItems: 'center',
                        backgroundColor: receiptImage ? '#f0fff4' : '#f8fbff',
                      }}
                    >
                      {receiptImage ? (
                        <>
                          <Image source={{ uri: receiptImage }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
                          <Text style={{ color: '#2ecc71', marginTop: 8, fontWeight: 'bold', fontSize: 13 }}>
                            {isRTL ? '✅ تم اختيار الصورة — اضغط للتغيير' : '✅ Image sélectionnée — Appuyer pour changer'}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={{ fontSize: 32 }}>📷</Text>
                          <Text style={{ color: '#3498db', fontWeight: 'bold', marginTop: 6, fontSize: 14 }}>
                            {isRTL ? 'اضغط لرفع صورة الإيصال' : 'Appuyer pour joindre le reçu'}
                          </Text>
                          <Text style={{ color: '#777', fontSize: 12, marginTop: 4 }}>
                            {isRTL ? 'صورة من المعاملة البنكية' : 'Capture d\'écran ou photo du reçu'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── زر التأكيد النهائي ── */}
              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={loading || uploadingReceipt || (!whatsappSent && !!shopWA)}
                style={{
                  backgroundColor: (loading || uploadingReceipt || (!whatsappSent && !!shopWA)) ? '#ccc' : '#FF6B35',
                  borderRadius: 14, padding: 15, alignItems: 'center',
                }}
              >
                {(loading || uploadingReceipt) ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>
                    {!whatsappSent && shopWA
                      ? (isRTL ? '⬆️ أرسل عبر واتساب أولاً' : '⬆️ Envoyez d\'abord via WhatsApp')
                      : (isRTL ? `✅ تأكيد الطلب • ${total} MRU` : `✅ Confirmer • ${total} MRU`)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* إلغاء */}
              <TouchableOpacity onPress={() => setShowWhatsAppModal(false)} style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ color: '#999', fontSize: 14 }}>
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── مكوّنات مساعدة ───────────────────────────────────────────────────────────
function SectionCard({ title, children, isRTL }) {
  return (
    <View style={{ backgroundColor: 'white', margin: 16, marginBottom: 0, borderRadius: 16, padding: 16 }}>
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 14, textAlign: isRTL ? 'right' : 'left' }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function InputField({ placeholder, value, onChangeText, keyboardType, multiline, isRTL }) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      style={{
        borderWidth: 1, borderColor: '#FFD4C2', borderRadius: 10,
        padding: 12, marginBottom: 10, fontSize: 14, color: '#333',
        backgroundColor: 'white', textAlign: isRTL ? 'right' : 'left',
        minHeight: multiline ? 70 : 44,
      }}
    />
  );
}

function BankAccountCard({ acc, isRTL }) {
  const copyToClipboard = (text) => {
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
    Alert.alert(isRTL ? '✅ تم النسخ' : '✅ Copié', isRTL ? `تم نسخ: ${text}` : `Copié: ${text}`, [{ text: 'OK' }], { cancelable: true });
  };

  return (
    <View style={{ backgroundColor: '#f0f7ff', borderRadius: 10, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#3498db' }}>
      <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>🏦 {acc.bankName}</Text>
      <TouchableOpacity
        onPress={() => copyToClipboard(acc.accountNumber)}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 6, gap: 8 }}
      >
        <Text style={{ color: '#3498db', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{acc.accountNumber}</Text>
        <View style={{ backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{isRTL ? '📋 نسخ' : '📋 Copier'}</Text>
        </View>
      </TouchableOpacity>
      {acc.accountHolder ? <Text style={{ color: '#555', fontSize: 13, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>👤 {acc.accountHolder}</Text> : null}
    </View>
  );
}
