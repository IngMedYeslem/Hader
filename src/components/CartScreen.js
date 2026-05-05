import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { getMediaUrl } from '../services/api';
import { useTranslation } from '../translations';

export default function CartScreen({ onBack, onCheckout }) {
  const { cartItems, cartShop, removeFromCart, updateQuantity, getTotalAmount, getTotalItems, clearCart } = useCart();
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';

  const total = getTotalAmount();
  const deliveryFee = 15;
  const grandTotal = total + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22, color: '#333' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginLeft: 8 }}>
            {isRTL ? 'سلة التسوق' : 'Mon panier'}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 80 }}>🛒</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginTop: 20 }}>
            {isRTL ? 'سلتك فارغة' : 'Votre panier est vide'}
          </Text>
          <Text style={{ color: '#888', marginTop: 8, textAlign: 'center' }}>
            {isRTL ? 'أضف منتجات من المتاجر المتاحة' : 'Ajoutez des articles depuis les restaurants'}
          </Text>
          <TouchableOpacity
            onPress={onBack}
            style={{ backgroundColor: '#FF6B35', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, marginTop: 24 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
              {isRTL ? 'تصفح المتاجر' : 'Parcourir les restaurants'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22, color: '#333' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50' }}>
          {isRTL ? 'سلة التسوق' : 'Mon panier'} ({getTotalItems()})
        </Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={{ color: '#FF6B35', fontSize: 13 }}>
            {isRTL ? 'إفراغ' : 'Vider'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Info */}
        {cartShop && (
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 14, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24 }}>🏪</Text>
            <View>
              <Text style={{ fontSize: 13, color: '#888' }}>{isRTL ? 'طلبك من' : 'Votre commande chez'}</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#2C3E50' }}>
                {cartShop.username || cartShop.name}
              </Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' }}>
          {cartItems.map((item, index) => {
            const imageUri = item.images?.[0] ? getMediaUrl(item.images[0]) : null;
            return (
              <View key={item._id} style={{
                flexDirection: isRTL ? 'row-reverse' : 'row', padding: 14, alignItems: 'center',
                borderBottomWidth: index < cartItems.length - 1 ? 1 : 0, borderBottomColor: '#f5f5f5',
              }}>
                {/* Image */}
                <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: '#f5f5f5', overflow: 'hidden', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24 }}>🍽️</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', textAlign: isRTL ? 'right' : 'left' }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 }}>
                    {item.price * item.quantity} MRU
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: item.quantity === 1 ? '#fee' : '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: item.quantity === 1 ? '#FF6B35' : '#333' }}>
                      {item.quantity === 1 ? '🗑' : '−'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2C3E50', minWidth: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item._id, item.quantity + 1)}
                    style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'ملخص الطلب' : 'Récapitulatif'}
          </Text>
          <SummaryRow label={isRTL ? 'المجموع الفرعي' : 'Sous-total'} value={`${total} MRU`} isRTL={isRTL} />
          <SummaryRow label={isRTL ? 'رسوم التوصيل' : 'Frais de livraison'} value={`${deliveryFee} MRU`} isRTL={isRTL} />
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
          <SummaryRow label={isRTL ? 'الإجمالي' : 'Total'} value={`${grandTotal} MRU`} isRTL={isRTL} bold />
        </View>

        {/* Promo Code */}
        <View style={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 12, padding: 14, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 20 }}>🎟️</Text>
          <Text style={{ flex: 1, color: '#888', fontSize: 14 }}>
            {isRTL ? 'هل لديك كود خصم؟' : 'Vous avez un code promo?'}
          </Text>
          <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 13 }}>
            {isRTL ? 'إضافة' : 'Ajouter'}
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TouchableOpacity
          onPress={onCheckout}
          style={{
            backgroundColor: '#FF6B35', borderRadius: 16, padding: 16,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{getTotalItems()}</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isRTL ? 'إتمام الطلب' : 'Passer la commande'}
          </Text>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{grandTotal} MRU</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, isRTL, bold }) {
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ color: bold ? '#2C3E50' : '#888', fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 16 : 14 }}>{label}</Text>
      <Text style={{ color: bold ? '#FF6B35' : '#2C3E50', fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 16 : 14 }}>{value}</Text>
    </View>
  );
}
