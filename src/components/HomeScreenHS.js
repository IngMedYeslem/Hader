import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, SafeAreaView, StatusBar, Animated, Dimensions, Platform, Modal
} from 'react-native';
import { fetchProductsWithShops } from '../services/apiService';
import { getServerStatus } from '../services/serverCheck';
import { useTranslation } from '../translations';
import { useCart } from '../contexts/CartContext';
import { getMediaUrl } from '../services/api';
import { useLastOrder } from '../hooks/useLastOrder';
import { useOffers } from '../hooks/useOffers';
import { isShopOpen } from '../utils/shopSchedule';






export default function HomeScreenHS({ onSelectShop, onShopLogin, onAdminAccess, onOpenCart, onResumeOrder }) {
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { getTotalItems } = useCart();
  const { lastOrder } = useLastOrder();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const { offers } = useOffers();

  const [showInstall, setShowInstall] = useState(false);
  const cartCount = getTotalItems();
  const isRTL = currentLanguage === 'ar';

  const STATIC_BANNERS = [
    { id: 's1', title: isRTL ? 'توصيل سريع' : (currentLanguage === 'fr' ? 'Livraison rapide' : 'Fast Delivery'), subtitle: isRTL ? 'في أقل من 30 دقيقة' : (currentLanguage === 'fr' ? 'En moins de 30 minutes' : 'In less than 30 minutes'), color: '#FF6B35', icon: '🚀' },
    { id: 's2', title: isRTL ? 'عروض حصرية' : (currentLanguage === 'fr' ? 'Offres exclusives' : 'Exclusive Offers'), subtitle: isRTL ? 'خصومات تصل إلى 50%' : (currentLanguage === 'fr' ? "Jusqu'\u00e0 50% de r\u00e9duction" : 'Up to 50% off'), color: '#6B3FA0', icon: '🎁' },
    { id: 's3', title: isRTL ? 'متاجر متنوعة' : (currentLanguage === 'fr' ? 'Boutiques vari\u00e9es' : 'Various Shops'), subtitle: isRTL ? 'اختر من أفضل المتاجر' : (currentLanguage === 'fr' ? 'Choisissez parmi les meilleurs' : 'Choose from the best'), color: '#1D7A4F', icon: '🏪' },
  ];

  const BANNERS = offers.length > 0
    ? offers.map(o => ({ id: o.id, title: o.title, subtitle: o.subtitle || '', color: o.color || '#FF6B35', icon: o.emoji || '🎁', offer: o }))
    : STATIC_BANNERS;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentBanner(0);
  }, [offers.length]);

  useEffect(() => {
    const len = BANNERS.length;
    if (!len) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % len);
    }, 3000);
    return () => clearInterval(interval);
  }, [BANNERS.length]);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = await getServerStatus();
      const online = status.isAvailable;
      setIsOffline(!online);

      if (online) {
        const { API_URL } = require('../config/api');
        const shopsRes = await fetch(`${API_URL}/shops`);
        if (shopsRes.ok) setShops(await shopsRes.json());
      }

      // fetchProductsWithShops يُرجع cache حتى offline
      const allProducts = await fetchProductsWithShops();
      setProducts(allProducts);
    } catch (e) {
      console.log('Error loading:', e);
      setIsOffline(true);
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


  const L = (ar, fr, en) => isRTL ? ar : (currentLanguage === 'fr' ? fr : en);
  const CATEGORIES = [
    { id: 'all',         label: L('الكل',                    'Tout',          'All'),         icon: '🏪' },
    { id: 'restaurant',  label: L('مطاعم',                   'Restaurants',   'Restaurants'), icon: '🍽️' },
    { id: 'foodstore',   label: L('مواد غذائية',             'Alimentation',  'Food Store'),  icon: '🥫' },
    { id: 'pharmacy',    label: L('صيدليات',                 'Pharmacies',    'Pharmacies'),  icon: '💊' },
    { id: 'clothing',    label: L('ملابس',                   'Vêtements',     'Clothing'),    icon: '👗' },
    { id: 'electronics', label: L('إلكترونيات',              'Électronique',  'Electronics'), icon: '📱' },
    { id: 'furniture',   label: L('أثاث ومنزل',              'Meubles',       'Furniture'),   icon: '🛋️' },
    { id: 'sports',      label: L('رياضة',                   'Sports',        'Sports'),      icon: '⚽' },
    { id: 'beauty',      label: L('جمال وعناية',             'Beauté',        'Beauty'),      icon: '💄' },
    { id: 'books',       label: L('كتب وقرطاسية',            'Livres',        'Books'),       icon: '📚' },
    { id: 'toys',        label: L('ألعاب أطفال',             'Jouets',        'Toys'),        icon: '🧸' },
    { id: 'hypermarket', label: L('هايبرماركت',              'Hypermarché',   'Hypermarket'), icon: '🏬' },
    { id: 'minimarket',  label: L('بقالة صغيرة',             'Épicerie',      'Mini Market'), icon: '🏪' },
    { id: 'automotive',  label: L('سيارات وقطع غيار',        'Automobile',    'Automotive'),  icon: '🚗' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* بانر Offline */}
      {isOffline && (
        <View style={{
          backgroundColor: '#2D2D2D',
          paddingVertical: 6,
          paddingHorizontal: 16,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          <Text style={{ fontSize: 14 }}>📵</Text>
          <Text style={{ color: '#FFD166', fontSize: 12, fontWeight: '600', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL
              ? 'أنت غير متصل — يتم عرض بيانات محفوظة'
              : currentLanguage === 'fr'
                ? 'Hors ligne — données en cache affichées'
                : 'Offline — showing cached data'}
          </Text>
        </View>
      )}

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
            📍 {isRTL ? ' نوصّل في كل' : 'Livraison partout en'}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isRTL ? 'موريتانيا' : 'Mauritanie'} ▾
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setLanguage(currentLanguage === 'ar' ? 'fr' : currentLanguage === 'fr' ? 'en' : 'ar')}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>
              {currentLanguage === 'ar' ? '🇲🇷 AR' : currentLanguage === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowInstall(true)}
            style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 3 }}
          >
            <Text style={{ fontSize: 13 }}>📲</Text>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
              {isRTL ? 'حمّل' : 'Installer'}
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
        {/* Active Order Banner */}
        {lastOrder && onResumeOrder && (
          <TouchableOpacity
            onPress={() => onResumeOrder(lastOrder)}
            style={{
              margin: 16, marginBottom: 0, backgroundColor: '#2C3E50',
              borderRadius: 14, padding: 14,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center', gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>📦</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                {isRTL ? 'لديك طلب نشط' : currentLanguage === 'fr' ? 'Vous avez une commande active' : 'You have an active order'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
                #{lastOrder.orderNumber} • {lastOrder.total} MRU
              </Text>
            </View>
            <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 13 }}>
              {isRTL ? 'متابعة ←' : currentLanguage === 'fr' ? 'Suivre →' : 'Track →'}
            </Text>
          </TouchableOpacity>
        )}

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
        {BANNERS.length > 0 && (() => {
          const safeIndex = currentBanner % BANNERS.length;
          const banner = BANNERS[safeIndex];
          return (
            <TouchableOpacity
              activeOpacity={0.92}
              style={{ margin: 16, borderRadius: 16, overflow: 'hidden', height: 140 }}
              onPress={() => {
                if (banner.offer?.link_type === 'store' && banner.offer?.store_id)
                  onSelectShop({ _id: banner.offer.store_id });
              }}
            >
              <View style={{ backgroundColor: banner.color, flex: 1, padding: 20, justifyContent: 'center', borderRadius: 16 }}>
                <Text style={{ fontSize: 40 }}>{banner.icon}</Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 8 }}>{banner.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{banner.subtitle}</Text>
              </View>
              <View style={{ position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', gap: 5 }}>
                {BANNERS.map((_, i) => (
                  <View key={i} style={{ width: i === safeIndex ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === safeIndex ? 'white' : 'rgba(255,255,255,0.5)' }} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })()}

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

      <Modal visible={showInstall} transparent animationType="slide" onRequestClose={() => setShowInstall(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          activeOpacity={1} onPress={() => setShowInstall(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'web' ? 24 : 40 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#FF6B35', textAlign: 'center', marginBottom: 4 }}>
                📲 {isRTL ? 'حمّل التطبيق' : "Installer l'app"}
              </Text>
              <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 }}>
                {isRTL ? 'بدون متجر — مجاناً على شاشتك' : 'Sans store — gratuit sur ton écran'}
              </Text>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#f0e6d3' }}>
                  <Image source={{ uri: 'https://hader.up.railway.app/hader-qr.png' }} style={{ width: 180, height: 180 }} resizeMode="contain" />
                </View>
                <Text style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>
                  {isRTL ? '📷 امسح بكاميرا هاتفك' : '📷 Scanner avec ton appareil photo'}
                </Text>
              </View>
              <View style={{ backgroundColor: '#fff8f5', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF6B35', marginBottom: 10, textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? '⬇️ خطوات التثبيت' : '⬇️ Comment installer'}
                </Text>
                {[
                  { n: '1', ar: 'امسح الـ QR أو افتح الرابط', fr: 'Scanne le QR ou ouvre le lien' },
                  { n: '2', ar: 'iPhone: مشاركة ← "أضف للشاشة الرئيسية"', fr: 'iPhone: Partager ← "Sur l\'écran d\'accueil"' },
                  { n: '2', ar: 'Android: القائمة ← "تثبيت التطبيق"', fr: 'Android: Menu ← "Installer l\'application"' },
                  { n: '3', ar: 'أيقونة حاضر ستظهر — جاهز! 🎉', fr: 'L\'icône Hader apparaît — prêt! 🎉' },
                ].map((s, i) => (
                  <View key={i} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <View style={{ backgroundColor: '#FF6B35', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{s.n}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left', lineHeight: 20 }}>
                      {isRTL ? s.ar : s.fr}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

function ShopCard({ shop, onPress, isRTL }) {
  const rating = shop.averageRating > 0 ? shop.averageRating.toFixed(1) : null;
  const shopOpen = isShopOpen(shop);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const { t } = useTranslation();

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
            <Text style={{ fontSize: 10, color: '#333', fontWeight: 'bold' }}>🕐 {deliveryTime} {t('minutes')}</Text>
          </View>
        )}
        {/* Closed badge */}
        {!shopOpen && (
          <View style={{
            position: 'absolute', top: 10, right: 10,
            backgroundColor: 'rgba(192,57,43,0.92)', borderRadius: 10,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
              🔒 {isRTL ? 'مغلق' : 'Fermé'}
            </Text>
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
