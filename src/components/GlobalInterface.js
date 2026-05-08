import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import GlobalNavbar from './GlobalNavbar';
import AdminInterface from './AdminInterface';
import RestaurantScreen from './RestaurantScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderTrackingScreen from './OrderTrackingScreen';
import { fetchProductsWithShops } from '../services/apiService';
import { getServerStatus } from '../services/serverCheck';
import { getMediaUrl } from '../services/api';
import { useTranslation } from '../translations';
import { useCart } from '../contexts/CartContext';
import styles from './styles';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function GlobalInterface({ onShopLogin }) {
  const { t, currentLanguage } = useTranslation();
  const { getTotalItems } = useCart();
  const isRTL = currentLanguage === 'ar';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [showAdminInterface, setShowAdminInterface] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const status = await getServerStatus();
        setServerAvailable(status.isAvailable);
        if (status.isAvailable) {
          // جلب المتاجر مباشرة
          const shopsRes = await fetch('${API_URL}/shops');
          if (shopsRes.ok) {
            const shopsData = await shopsRes.json();
            setShops(Array.isArray(shopsData) ? shopsData : []);
          }
          // جلب المنتجات لحساب عدد منتجات كل متجر
          const data = await fetchProductsWithShops();
          setProducts(data);
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        setServerAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (showAdminInterface) {
    return <AdminInterface onBack={() => setShowAdminInterface(false)} />;
  }

  if (placedOrder) {
    return (
      <OrderTrackingScreen
        order={placedOrder}
        onBack={() => setPlacedOrder(null)}
        onNewOrder={() => { setPlacedOrder(null); setSelectedShop(null); }}
      />
    );
  }

  if (selectedShop) {
    if (showCheckout) {
      return (
        <CheckoutScreen
          onBack={() => setShowCheckout(false)}
          onOrderPlaced={(order) => {
            setShowCheckout(false);
            setShowCart(false);
            setPlacedOrder(order);
          }}
        />
      );
    }
    if (showCart) {
      return (
        <CartScreen
          onBack={() => setShowCart(false)}
          onCheckout={() => setShowCheckout(true)}
        />
      );
    }
    return (
      <RestaurantScreen
        shop={selectedShop}
        onBack={() => setSelectedShop(null)}
        onOpenCart={() => setShowCart(true)}
      />
    );
  }

  const cartCount = getTotalItems();

  return (
    <ImageBackground
      source={require('../../assets/b2.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <GlobalNavbar
        onShopLogin={onShopLogin}
        onAdminAccess={() => setShowAdminInterface(true)}
        shopCount={shops.length}
      />

      {!serverAvailable && !loading && (
        <View style={{ backgroundColor: 'rgba(255,0,0,0.1)', margin: 10, padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red', fontSize: 12, textAlign: 'center' }}>
            ❌ {isRTL ? 'الخادم غير متاح' : 'Serveur non disponible'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.wrapper} contentContainerStyle={{ padding: 15 }}>
        {loading ? (
          <Text style={[styles.loadingText, { textAlign: 'center', marginTop: 40 }]}>
            {t('loadingProducts')}
          </Text>
        ) : shops.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>🏪</Text>
            <Text style={{ color: '#FF6B35', fontSize: 16, marginTop: 10, textAlign: 'center' }}>
              {isRTL ? 'لا توجد متاجر متاحة' : 'Aucune boutique disponible'}
            </Text>
          </View>
        ) : (
          shops.map((shop) => {
            const shopProducts = products.filter(p => p.shop?._id === shop._id);
            const coverUri = shop.coverImage ? getMediaUrl(shop.coverImage)
              : shop.mainImage ? getMediaUrl(shop.mainImage) : null;
            const avatarUri = shop.profileImage ? getMediaUrl(shop.profileImage) : null;
            return (
              <TouchableOpacity
                key={shop._id}
                onPress={() => setSelectedShop({
                  ...shop,
                  username: shop.name,  // RestaurantScreen يستخدم username
                })}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  marginBottom: 16,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                {/* غلاف المتجر */}
                <View style={{ height: 120, backgroundColor: '#FF6B35' }}>
                  {coverUri ? (
                    <Image source={{ uri: coverUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 40 }}>🏪</Text>
                    </View>
                  )}
                </View>

                {/* معلومات المتجر */}
                <View style={{ padding: 14, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0, borderWidth: 2, borderColor: '#FF6B35' }}
                    />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>
                        {(shop.name || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
                      {shop.name}
                    </Text>
                    {shop.address && (
                      <Text style={{ fontSize: 12, color: '#777', marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                        📍 {shop.address}
                      </Text>
                    )}
                    <Text style={{ fontSize: 12, color: '#FF6B35', marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                      {shopProducts.length > 0 ? `${shopProducts.length} ${isRTL ? 'منتج' : 'produits'}` : (isRTL ? 'متجر جديد' : 'Nouveau magasin')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: '#FF6B35' }}>{isRTL ? '←' : '→'}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* زر السلة العائم */}
      {cartCount > 0 && (
        <TouchableOpacity
          onPress={() => setShowCart(true)}
          style={{
            position: 'absolute', bottom: 20, right: 20,
            backgroundColor: '#FF6B35', borderRadius: 30, width: 60, height: 60,
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
          }}
        >
          <Text style={{ fontSize: 24 }}>🛒</Text>
          <View style={{
            position: 'absolute', top: 4, right: 4,
            backgroundColor: 'white', borderRadius: 8, width: 16, height: 16,
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ color: '#FF6B35', fontSize: 9, fontWeight: 'bold' }}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
}