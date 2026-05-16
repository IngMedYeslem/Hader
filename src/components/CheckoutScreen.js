import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, Image, Clipboard, Platform
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
  { id: 'bank', label: 'تحويل بنكي', labelFr: 'Virement bancaire', icon: '🏦' },
];

export default function CheckoutScreen({ onBack, onOrderPlaced }) {
  const { cartItems, cartShop, getTotalAmount, clearCart, deliveryAddress, deliveryPhone, setDeliveryAddress, setDeliveryPhone } = useCart();
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(deliveryPhone || '');
  const [address, setAddress] = useState(deliveryAddress || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const deliveryFee = 15;
  const total = getTotalAmount() + deliveryFee;
  const shopId = cartShop?._id?.toString() || cartShop?.id?.toString() || cartShop?._id || cartShop?.id;

  useEffect(() => {
    fetchGpsLocation();
  }, []);

  const fetchGpsLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isRTL ? 'تنبيه' : 'Attention',
          isRTL ? 'لم يتم السماح بالوصول للموقع. يمكنك إدخال العنوان يدوياً.' : 'Accès à la localisation refusé. Vous pouvez saisir l\'adresse manuellement.'
        );
        return;
      }
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
    // استخدام bankAccounts من cartShop مباشرة إن وجدت
    if (cartShop?.bankAccounts?.length > 0) {
      setBankAccounts(cartShop.bankAccounts);
      return;
    }
    // fallback: جلب من API
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const uploadReceipt = async (orderId, imageUri) => {
    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `receipt_${orderId}.jpg`,
      });
      const uploadRes = await fetch(`${BASE}/upload-receipt`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadData = await uploadRes.json();
      if (uploadData.receiptPath) {
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

  const handlePlaceOrder = async () => {
    if (!phone.trim() || !address.trim()) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى ملء رقم الهاتف والعنوان' : 'Veuillez remplir le téléphone et l\'adresse'
      );
      return;
    }
    if (paymentMethod === 'bank' && !receiptImage) {
      Alert.alert(
        isRTL ? 'مطلوب' : 'Requis',
        isRTL ? 'يرجى رفع صورة إيصال التحويل البنكي' : 'Veuillez joindre le reçu de virement'
      );
      return;
    }

    setLoading(true);
    try {
      setDeliveryPhone(phone);
      setDeliveryAddress(address);

      const finalShopId = shopId || cartItems[0]?.shopId;
      if (!finalShopId) {
        Alert.alert(
          isRTL ? 'خطأ' : 'Erreur',
          isRTL ? 'لم يتم تحديد المتجر، يرجى إعادة المحاولة' : 'Boutique non identifiée, veuillez réessayer'
        );
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

      console.log('📦 Sending order → shopId:', finalShopId, 'to:', BASE);

      const response = await fetch(`${BASE}/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('📦 Order response:', data);

      if (!data.success) {
        Alert.alert(isRTL ? 'خطأ' : 'Erreur', data.error || (isRTL ? 'فشل إنشاء الطلب' : 'Impossible de créer la commande'));
        setLoading(false);
        return;
      }

      const orderNumber = data.orderNumber;
      const orderId = data.orderId;

      // Upload receipt if bank payment
      if (paymentMethod === 'bank' && receiptImage && orderId) {
        await uploadReceipt(orderId, receiptImage);
      }

      const orderObj = { _id: orderId, orderNumber, phone, address, total, paymentMethod, customerName: name };
      await saveLastOrder(orderObj);
      clearCart();
      onOrderPlaced(orderObj);
    } catch (error) {
      Alert.alert(isRTL ? 'خطأ' : 'Erreur', isRTL ? 'فشل إنشاء الطلب' : 'Impossible de créer la commande');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Delivery Info */}
        <SectionCard title={isRTL ? '📍 معلومات التوصيل' : '📍 Informations de livraison'} isRTL={isRTL}>
          <InputField placeholder={isRTL ? 'الاسم الكامل (اختياري)' : 'Nom complet (optionnel)'} value={name} onChangeText={setName} isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'رقم الهاتف *' : 'Numéro de téléphone *'} value={phone} onChangeText={setPhone} keyboardType="phone-pad" isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'عنوان التوصيل *' : 'Adresse de livraison *'} value={address} onChangeText={setAddress} multiline isRTL={isRTL} />
          <InputField placeholder={isRTL ? 'ملاحظات للمتجر (اختياري)' : 'Notes pour le restaurant (optionnel)'} value={notes} onChangeText={setNotes} multiline isRTL={isRTL} />

          {/* GPS Status */}
          <TouchableOpacity
            onPress={fetchGpsLocation}
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8,
              padding: 10, borderRadius: 10, marginTop: 4,
              backgroundColor: gpsLocation ? '#f0fff4' : '#fff8f5',
              borderWidth: 1, borderColor: gpsLocation ? '#2ecc71' : '#FFD4C2',
            }}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <Text style={{ fontSize: 18 }}>{gpsLocation ? '📍' : '🔍'}</Text>
            )}
            <Text style={{ flex: 1, fontSize: 13, color: gpsLocation ? '#27ae60' : '#FF6B35', textAlign: isRTL ? 'right' : 'left' }}>
              {gpsLoading
                ? (isRTL ? 'جاري تحديد الموقع...' : 'Localisation en cours...')
                : gpsLocation
                ? (isRTL ? `✅ تم تحديد الموقع (${gpsLocation.latitude.toFixed(4)}, ${gpsLocation.longitude.toFixed(4)})` : `✅ Position détectée (${gpsLocation.latitude.toFixed(4)}, ${gpsLocation.longitude.toFixed(4)})`)
                : (isRTL ? 'اضغط لتحديد موقعك تلقائياً' : 'Appuyer pour détecter votre position')}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* Payment Method */}
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

        {/* Bank Accounts - shown when bank payment selected */}
        {paymentMethod === 'bank' && (
          <SectionCard title={isRTL ? '🏦 أرقام الحسابات البنكية' : '🏦 Comptes bancaires'} isRTL={isRTL}>
            {bankAccounts.length === 0 ? (
              <Text style={{ color: '#777', textAlign: 'center', padding: 10 }}>
                {isRTL ? 'لا توجد حسابات بنكية متاحة' : 'Aucun compte bancaire disponible'}
              </Text>
            ) : (
              bankAccounts.map((acc, i) => (
                <BankAccountCard key={i} acc={acc} isRTL={isRTL} />
              ))
            )}

            {/* Receipt Upload */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '📎 صورة إيصال التحويل *' : '📎 Reçu de virement *'}
              </Text>
              <TouchableOpacity
                onPress={pickReceiptImage}
                style={{
                  borderWidth: 2, borderColor: receiptImage ? '#2ecc71' : '#FF6B35',
                  borderStyle: 'dashed', borderRadius: 12, padding: 16,
                  alignItems: 'center', backgroundColor: receiptImage ? '#f0fff4' : '#fff8f5'
                }}
              >
                {receiptImage ? (
                  <>
                    <Image source={{ uri: receiptImage }} style={{ width: '100%', height: 180, borderRadius: 8 }} resizeMode="cover" />
                    <Text style={{ color: '#2ecc71', marginTop: 8, fontWeight: 'bold' }}>
                      {isRTL ? '✅ تم اختيار الصورة - اضغط للتغيير' : '✅ Image sélectionnée - Appuyer pour changer'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 36 }}>📷</Text>
                    <Text style={{ color: '#FF6B35', fontWeight: 'bold', marginTop: 8 }}>
                      {isRTL ? 'اضغط لرفع صورة الإيصال' : 'Appuyer pour joindre le reçu'}
                    </Text>
                    <Text style={{ color: '#777', fontSize: 12, marginTop: 4 }}>
                      {isRTL ? 'صورة من المعاملة البنكية' : 'Capture d\'écran ou photo du reçu'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SectionCard>
        )}

        {/* Order Summary */}
        <SectionCard title={isRTL ? '🧾 ملخص الطلب' : '🧾 Récapitulatif'} isRTL={isRTL}>
          {cartItems.map(item => (
            <View key={item._id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                {item.name} × {item.quantity}
              </Text>
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

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading || uploadingReceipt}
          style={{ backgroundColor: (loading || uploadingReceipt) ? '#ccc' : '#FF6B35', borderRadius: 16, padding: 16, alignItems: 'center' }}
        >
          {(loading || uploadingReceipt) ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {isRTL ? `تأكيد الطلب • ${total} MRU` : `Confirmer • ${total} MRU`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    Alert.alert(
      isRTL ? '✅ تم النسخ' : '✅ Copié',
      isRTL ? `تم نسخ: ${text}` : `Copié: ${text}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  return (
    <View style={{ backgroundColor: '#f0f7ff', borderRadius: 10, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#3498db' }}>
      <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>
        🏦 {acc.bankName}
      </Text>
      <TouchableOpacity
        onPress={() => copyToClipboard(acc.accountNumber)}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 6, gap: 8 }}
      >
        <Text style={{ color: '#3498db', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
          {acc.accountNumber}
        </Text>
        <View style={{ backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
            {isRTL ? '📋 نسخ' : '📋 Copier'}
          </Text>
        </View>
      </TouchableOpacity>
      {acc.accountHolder ? (
        <Text style={{ color: '#555', fontSize: 13, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
          👤 {acc.accountHolder}
        </Text>
      ) : null}
    </View>
  );
}
