import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { getMediaUrl } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../translations';

export default function ShopHeader({ onBack, onOpenCart, showCart = true }) {
  const { cartShop, getTotalItems } = useCart();
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const cartCount = getTotalItems();

  if (!cartShop) return null;

  const imageUri = cartShop.mainImage
    ? getMediaUrl(cartShop.mainImage)
    : cartShop.coverImage
    ? getMediaUrl(cartShop.coverImage)
    : null;

  return (
    <View>
      {/* Cover */}
      <View style={{ height: 110, backgroundColor: '#FF6B35' }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>🏪</Text>
          </View>
        )}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />

        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{
              position: 'absolute', top: 12, left: 12,
              backgroundColor: 'white', borderRadius: 20, width: 36, height: 36,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>←</Text>
          </TouchableOpacity>
        )}

        {/* Cart Button */}
        {showCart && onOpenCart && (
          <TouchableOpacity
            onPress={onOpenCart}
            style={{
              position: 'absolute', top: 12, right: 12,
              backgroundColor: 'white', borderRadius: 20, width: 36, height: 36,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🛒</Text>
            {cartCount > 0 && (
              <View style={{
                position: 'absolute', top: -4, right: -4,
                backgroundColor: '#FF6B35', borderRadius: 8, width: 16, height: 16,
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Shop Info Bar */}
      <View style={{
        backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#eee',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
      }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 38, height: 38, borderRadius: 19, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0, borderWidth: 2, borderColor: '#FF6B35' }} />
        ) : (
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {(cartShop.username || cartShop.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
            {cartShop.username || cartShop.name}
          </Text>
          {cartShop.address ? (
            <Text style={{ fontSize: 11, color: '#777', textAlign: isRTL ? 'right' : 'left' }}>
              📍 {cartShop.address}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
