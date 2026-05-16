import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, SafeAreaView, StatusBar, Animated, Dimensions, Platform
} from 'react-native';
import { fetchProductsWithShops } from '../services/apiService';
import { getServerStatus } from '../services/serverCheck';
import { useTranslation } from '../translations';
import { useCart } from '../contexts/CartContext';
import { getMediaUrl } from '../services/api';

const { width } = Dimensions.get('window');





export default function HomeScreenHS({ onSelectShop, onShopLogin, onAdminAccess, onOpenCart }) {
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = await getServerStatus();
      if (status.isAvailable) {
        const { API_URL } = require('../config/api');

        // جلب المتاجر مع عدد المنتجات من الباكند
        const shopsRes = await fetch(`${API_URL}/shops`);
        if (shopsRes.ok) {
          const allShops = await shopsRes.json();
          setShops(allShops);
        }

        // جلب المنتجات للعرض في الواجهة
        const allProducts = await fetchProductsWithShops();
        setProducts(allProducts);
      }
    } catch (e) {
      console.log('Error loading:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchSearch = !searchText ||
      shop.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      shop.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = selectedCategory === 'all' ||
      (shop.category || '').toLowerCase() === selectedCategory ||
      (shop.category || '').toLowerCase().includes(selectedCategory);
    return matchSearch && matchCategory;
  });

  const cartCount = getTotalItems();
  const isRTL = currentLanguage === 'ar';

  const BANNERS = [
    { 
      id: 1, 
      title: isRTL ? 'توصيل سريع' : (currentLanguage === 'fr' ? 'Livraison rapide' : 'Fast Delivery'),
      subtitle: isRTL ? 'في أقل من 30 دقيقة' : (currentLanguage === 'fr' ? 'En moins de 30 minutes' : 'In less than 30 minutes'),
      color: '#FF6B35', 
      icon: '🚀' 
    },
    { 
      id: 2, 
      title: isRTL ? 'عروض حصرية' : (currentLanguage === 'fr' ? 'Offres exclusives' : 'Exclusive Offers'),
      subtitle: isRTL ? 'خصومات تصل إلى 50%' : (currentLanguage === 'fr' ? 'Jusqu\'à 50% de réduction' : 'Up to 50% off'),
      color: '#FF6B35', 
      icon: '🎁' 
    },
    { 
      id: 3, 
      title: isRTL ? 'متاجر متنوعة' : (currentLanguage === 'fr' ? 'Boutiques variées' : 'Various Shops'),
      subtitle: isRTL ? 'اختر من أفضل المتاجر' : (currentLanguage === 'fr' ? 'Choisissez parmi les meilleurs' : 'Choose from the best'),
      color: '#333', 
      icon: '🏪' 
    },
  ];

  const CATEGORIES = [
    { id: 'all', label: isRTL ? 'الكل' : (currentLanguage === 'fr' ? 'Tout' : 'All'), icon: '🏪' },
    { id: 'food', label: isRTL ? 'طعام' : (currentLanguage === 'fr' ? 'Restaurant' : 'Food'), icon: '🍔' },
    { id: 'grocery', label: isRTL ? 'بقالة' : (currentLanguage === 'fr' ? 'Épicerie' : 'Grocery'), icon: '🛒' },
    { id: 'pharmacy', label: isRTL ? 'صيدلية' : (currentLanguage === 'fr' ? 'Pharmacie' : 'Pharmacy'), icon: '💊' },
    { id: 'electronics', label: isRTL ? 'إلكترونيات' : (currentLanguage === 'fr' ? 'Électronique' : 'Electronics'), icon: '📱' },
    { id: 'fashion', label: isRTL ? 'أزياء' : (currentLanguage === 'fr' ? 'Mode' : 'Fashion'), icon: '👗' },
    { id: 'other', label: isRTL ? 'أخرى' : (currentLanguage === 'fr' ? 'Autre' : 'Other'), icon: '📦' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <View style={{
        backgroundColor: '#FF6B35',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            📍 {isRTL ? 'توصيل إلى' : 'Livraison à'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isRTL ? 'موريتانيا' : 'Mauritanie'} ▾
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setLanguage(currentLanguage === 'ar' ? 'fr' : currentLanguage === 'fr' ? 'en' : 'ar')}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>
              {currentLanguage === 'ar' ? '🇲🇷 AR' : currentLanguage === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenCart} style={{ position: 'relative' }}>
            <Text style={{ fontSize: 24 }}>🛒</Text>
            {cartCount > 0 && (
              <View style={{
                position: 'absolute', top: -5, right: -5,
                backgroundColor: '#FF6B35', borderRadius: 10,
                width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 25, flexDirection: 'row',
            alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder={isRTL ? 'ابحث عن متجر أو منتج...' : 'Rechercher un restaurant...'}
              value={searchText}
              onChangeText={setSearchText}
              style={{ flex: 1, fontSize: 14, color: '#333', textAlign: isRTL ? 'right' : 'left' }}
            />
          </View>
        </View>

        {/* Banner Carousel */}
        <View style={{ margin: 16, borderRadius: 16, overflow: 'hidden', height: 140 }}>
          <View style={{
            backgroundColor: BANNERS[currentBanner].color,
            flex: 1, padding: 20, justifyContent: 'center',
            borderRadius: 16,
          }}>
            <Text style={{ fontSize: 40 }}>{BANNERS[currentBanner].icon}</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 8 }}>
              {BANNERS[currentBanner].title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              {BANNERS[currentBanner].subtitle}
            </Text>
          </View>
          {/* Dots */}
          <View style={{ position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', gap: 5 }}>
            {BANNERS.map((_, i) => (
              <View key={i} style={{
                width: i === currentBanner ? 16 : 6, height: 6,
                borderRadius: 3, backgroundColor: i === currentBanner ? 'white' : 'rgba(255,255,255,0.5)',
              }} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginHorizontal: 16, marginBottom: 12 }}>
            {isRTL ? 'التصنيفات' : 'Catégories'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
                  backgroundColor: selectedCategory === cat.id ? '#FF6B35' : 'white',
                  borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
                  borderWidth: selectedCategory === cat.id ? 0 : 1,
                  borderColor: '#FFD4C2',
                }}
              >
                <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                <Text style={{
                  fontSize: 11, marginTop: 4, fontWeight: '600',
                  color: selectedCategory === cat.id ? 'white' : '#555',
                }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shops Section */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
              🏪 {isRTL ? 'المتاجر المتاحة' : 'Boutiques disponibles'}
            </Text>
            <Text style={{ fontSize: 13, color: '#FF6B35' }}>
              {filteredShops.length} {isRTL ? 'متجر' : 'boutiques'}
            </Text>
          </View>
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 30 }}>⏳</Text>
              <Text style={{ color: '#777', marginTop: 10 }}>
                {isRTL ? 'جاري التحميل...' : 'Chargement...'}
              </Text>
            </View>
          ) : filteredShops.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>🏪</Text>
              <Text style={{ color: '#777', marginTop: 10, textAlign: 'center' }}>
                {isRTL ? 'لا توجد متاجر في هذا الصنف' : 'Aucune boutique dans cette catégorie'}
              </Text>
            </View>
          ) : (
            filteredShops.map(shop => (
              <ShopCard key={shop._id} shop={shop} onPress={() => onSelectShop(shop)} isRTL={isRTL} />
            ))
          )}
        </View>

        {/* Admin & Shop Login */}
        <View style={{ flexDirection: 'row', margin: 16, gap: 10 }}>
          <TouchableOpacity
            onPress={onShopLogin}
            style={{
              flex: 1, backgroundColor: '#FF6B35', padding: 14,
              borderRadius: 12, alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
              🏪 {isRTL ? 'مساحة المتجر' : 'Espace Boutique'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdminAccess}
            style={{
              flex: 1, backgroundColor: 'white', padding: 14,
              borderRadius: 12, alignItems: 'center',
              borderWidth: 1.5, borderColor: '#FF6B35',
            }}
          >
            <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 13 }}>
              👨‍💼 {isRTL ? 'الإدارة' : 'Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ShopCard({ shop, onPress, isRTL }) {
  const rating = shop.averageRating > 0 ? shop.averageRating.toFixed(1) : null;
  const [deliveryTime, setDeliveryTime] = useState(null);

  useEffect(() => {
    if (!shop._id) return;
    const { API_URL } = require('../config/api');
    fetch(`${API_URL}/shops/${shop._id}/delivery-time`)
      .then(r => r.json())
      .then(data => data.deliveryTime && setDeliveryTime(data.deliveryTime))
      .catch(() => {});
  }, [shop._id]);

  const coverUri = shop.mainImage
    ? (shop.mainImage.startsWith('/uploads') ? getMediaUrl(shop.mainImage) : shop.mainImage)
    : (shop.coverImage ? getMediaUrl(shop.coverImage) : null);
  const avatarUri = shop.profileImage ? getMediaUrl(shop.profileImage) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white', borderRadius: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden',
      }}
    >
      {/* Cover Image */}
      <View style={{ height: 140, backgroundColor: '#FFF0EB', justifyContent: 'center', alignItems: 'center' }}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 50 }}>🏪</Text>
        )}
        {/* Delivery time badge */}
        {deliveryTime && (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: 'white', borderRadius: 12,
            paddingHorizontal: 8, paddingVertical: 4,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 10, color: '#333', fontWeight: 'bold' }}>🕐 {deliveryTime}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }} />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                  {(shop.username || shop.name || '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 }} numberOfLines={1}>
              {shop.username || shop.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
            {rating ? (
              <><Text style={{ fontSize: 12 }}>⭐</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FF6B35', marginLeft: 2 }}>{rating}</Text></>
            ) : (
              <Text style={{ fontSize: 12, color: '#aaa' }}>☆☆☆☆☆</Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 8, gap: 12 }}>
          <Text style={{ fontSize: 12, color: '#777' }}>
            📦 {shop.productCount} {isRTL ? 'منتج' : 'produits'}
          </Text>
          {shop.deliveryFee > 0 && (
            <Text style={{ fontSize: 12, color: '#777' }}>
              🛵 {shop.deliveryFee} MRU {isRTL ? 'توصيل' : 'livraison'}
            </Text>
          )}
          {shop.minPrice !== Infinity && (
            <Text style={{ fontSize: 12, color: '#FF6B35', fontWeight: '600' }}>
              {isRTL ? 'من' : 'Dès'} {shop.minPrice} MRU
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
