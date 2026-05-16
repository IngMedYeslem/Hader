import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StatusBar, Animated, Dimensions, Modal, Alert, ActivityIndicator
} from 'react-native';
import { fetchProductsByShop } from '../services/apiService';
import { getMediaUrl } from '../services/api';
import { API_CONFIG } from '../config/api';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../translations';

const { width } = Dimensions.get('window');

export default function RestaurantScreen({ shop, onBack, onOpenCart }) {
  const { addToCart, cartItems, getTotalItems, getTotalAmount, cartShop } = useCart();
  const { t, currentLanguage } = useTranslation();
  const [products, setProducts] = useState([]);
  const [availableStock, setAvailableStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showDifferentShopAlert, setShowDifferentShopAlert] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const cartBarAnim = useRef(new Animated.Value(0)).current;
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    loadShopProducts(1, false);
    const shopId = shop._id || shop.id;
    fetch(`${API_CONFIG.BASE_URL}/shops/${shopId}/delivery-time`)
      .then(r => r.json())
      .then(data => data.deliveryTime && setDeliveryTime(data.deliveryTime))
      .catch(() => {});
  }, [shop]);

  useEffect(() => {
    const count = getTotalItems();
    Animated.spring(cartBarAnim, {
      toValue: count > 0 ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [cartItems]);

  const loadAvailableStock = async (shopId) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/products/shop/${shopId}/available-stock`);
      if (res.ok) setAvailableStock(await res.json());
    } catch {}
  };

  const loadShopProducts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      const shopId = shop._id || shop.id;
      const newProducts = await fetchProductsByShop(shopId, pageNum);
      if (newProducts.length < 20) setHasMore(false);
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      if (pageNum === 1) await loadAvailableStock(shopId);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadShopProducts(nextPage, true);
    }
  };

  const visibleProducts = useMemo(() => products, [products]);

  const categories = useMemo(() =>
    ['all', ...new Set(visibleProducts.map(p => p.category).filter(Boolean))]
  , [visibleProducts]);

  const flatListData = useMemo(() => {
    const filtered = selectedCategory === 'all'
      ? visibleProducts
      : visibleProducts.filter(p => p.category === selectedCategory);

    // Build sections: [{type:'header', category}, {type:'item', ...product}]
    const grouped = {};
    filtered.forEach(p => {
      const cat = p.category || (isRTL ? 'عام' : 'Général');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    const rows = [];
    Object.entries(grouped).forEach(([cat, items]) => {
      rows.push({ type: 'header', category: cat, key: `header_${cat}` });
      items.forEach(p => rows.push({ type: 'item', ...p, key: p._id || p.id }));
    });
    return rows;
  }, [visibleProducts, selectedCategory, isRTL]);

  const handleAddToCart = useCallback((product) => {
    if (cartShop && cartShop._id !== shop._id && getTotalItems() > 0) {
      setPendingProduct(product);
      setShowDifferentShopAlert(true);
      return;
    }
    const pid = product._id || product.id;
    const maxQty = availableStock[pid] !== undefined ? availableStock[pid] : Infinity;
    const inCartQty = cartItems.find(i => i._id === pid)?.quantity || 0;
    if (inCartQty + quantity > maxQty) {
      Alert.alert(
        isRTL ? 'كمية غير كافية' : 'Stock insuffisant',
        isRTL ? `الكمية المتاحة: ${maxQty}` : `Quantité disponible: ${maxQty}`
      );
      return;
    }
    addToCart(product, quantity, shop);
    setSelectedProduct(null);
    setQuantity(1);
  }, [cartShop, shop, availableStock, cartItems, quantity, addToCart]);

  const confirmClearAndAdd = () => {
    if (pendingProduct) {
      addToCart(pendingProduct, 1, shop);
      setPendingProduct(null);
    }
    setShowDifferentShopAlert(false);
  };

  const cartCount = getTotalItems();
  const cartTotal = getTotalAmount();

  const mainImageUri = shop.mainImage
    ? getMediaUrl(shop.mainImage)
    : shop.coverImage
    ? getMediaUrl(shop.coverImage)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Different Shop Alert */}
      <Modal visible={showDifferentShopAlert} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 12 }}>
              🛒 {isRTL ? 'سلة من متجر آخر' : "Panier d'un autre restaurant"}
            </Text>
            <Text style={{ color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
              {isRTL
                ? 'سلتك تحتوي على منتجات من متجر آخر. هل تريد إفراغها والبدء من هذا المتجر؟'
                : "Votre panier contient des articles d'un autre restaurant. Voulez-vous le vider et recommencer?"}
            </Text>
            <TouchableOpacity
              onPress={confirmClearAndAdd}
              style={{ backgroundColor: '#FF6B35', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                {isRTL ? 'نعم، ابدأ من جديد' : 'Oui, recommencer'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDifferentShopAlert(false)}
              style={{ padding: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#555', fontSize: 15 }}>
                {isRTL ? 'إلغاء' : 'Annuler'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} transparent animationType="slide">
        {selectedProduct && (() => {
          const pid = selectedProduct._id || selectedProduct.id;
          const maxQty = availableStock[pid] !== undefined ? availableStock[pid] : 99;
          const inCartQty = cartItems.find(i => i._id === pid)?.quantity || 0;
          const remaining = Math.max(0, maxQty - inCartQty);
          return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}>
                <ScrollView>
                  {/* Product Image */}
                  <View style={{ height: 220, backgroundColor: '#FFF0EB' }}>
                    {selectedProduct.images?.[0] ? (
                      <Image
                        source={{ uri: getMediaUrl(selectedProduct.images[0]) }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 60 }}>🍽️</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => { setSelectedProduct(null); setQuantity(1); }}
                      style={{
                        position: 'absolute', top: 16, right: 16,
                        backgroundColor: 'white', borderRadius: 20, width: 36, height: 36,
                        justifyContent: 'center', alignItems: 'center',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
                      {selectedProduct.name}
                    </Text>
                    {selectedProduct.description && (
                      <Text style={{ color: '#777', marginTop: 8, lineHeight: 22, textAlign: isRTL ? 'right' : 'left' }}>
                        {selectedProduct.description}
                      </Text>
                    )}
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF6B35', marginTop: 12 }}>
                      {selectedProduct.price} MRU
                    </Text>

                    {maxQty < 10 && (
                      <Text style={{ color: '#e67e22', fontSize: 13, textAlign: 'center', marginTop: 10 }}>
                        {isRTL ? `⚠️ متبقي: ${maxQty} فقط` : `⚠️ Reste: ${maxQty} seulement`}
                      </Text>
                    )}

                    {/* Quantity Selector */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 20 }}>
                      <TouchableOpacity
                        onPress={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0EB', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>−</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', minWidth: 30, textAlign: 'center' }}>{quantity}</Text>
                      <TouchableOpacity
                        onPress={() => setQuantity(q => Math.min(remaining, q + 1))}
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: quantity < remaining ? '#FF6B35' : '#ccc', justifyContent: 'center', alignItems: 'center' }}
                        disabled={quantity >= remaining}
                      >
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                {/* Add to Cart Button */}
                <View style={{ padding: 20, paddingBottom: 30 }}>
                  <TouchableOpacity
                    onPress={() => handleAddToCart(selectedProduct)}
                    style={{
                      backgroundColor: '#FF6B35', borderRadius: 16, padding: 16,
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>{quantity}</Text>
                    </View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                      {isRTL ? 'إضافة إلى السلة' : 'Ajouter au panier'}
                    </Text>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                      {selectedProduct.price * quantity} MRU
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })()}
      </Modal>

      {/* Shop Header - ثابت */}
      <View>
        {/* Cover */}
        <View style={{ height: 200, backgroundColor: '#FF6B35' }}>
            {mainImageUri ? (
              <Image source={{ uri: mainImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 60 }}>🏪</Text>
              </View>
            )}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
            <TouchableOpacity
              onPress={onBack}
              style={{
                position: 'absolute', top: 16, left: 16,
                backgroundColor: 'white', borderRadius: 20, width: 40, height: 40,
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
              }}
            >
              <Text style={{ fontSize: 18, color: '#333' }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onOpenCart}
              style={{
                position: 'absolute', top: 16, right: 16,
                backgroundColor: 'white', borderRadius: 20, width: 40, height: 40,
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>🛒</Text>
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
          </View>

          {/* Shop Info Card */}
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16, marginTop: -30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
              {mainImageUri ? (
                <Image source={{ uri: mainImageUri }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }} />
              ) : (
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 22 }}>
                    {(shop.username || shop.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
                  {shop.username || shop.name}
                </Text>
                {shop.address && (
                  <Text style={{ color: '#777', fontSize: 13, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                    📍 {shop.address}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
              <View style={{ alignItems: 'center' }}>
                {shop.averageRating > 0 ? (
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF6B35' }}>
                    {'⭐'.repeat(Math.round(shop.averageRating))} {shop.averageRating.toFixed(1)}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#aaa' }}>☆☆☆☆☆</Text>
                )}
                <Text style={{ fontSize: 11, color: '#777' }}>{isRTL ? 'التقييم' : 'Note'}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#eee' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF6B35' }}>{deliveryTime ? `${deliveryTime} ${t('minutes')}` : t('notDefined')}</Text>
                <Text style={{ fontSize: 11, color: '#777' }}>{t('deliveryLabel')}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#eee' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{visibleProducts.length}</Text>
                <Text style={{ fontSize: 11, color: '#777' }}>{isRTL ? 'منتج' : 'Produits'}</Text>
              </View>
            </View>
          </View>
      </View>

      {/* Category Tabs - ثابت */}
      <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === cat ? '#FF6B35' : '#f5f5f5',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: selectedCategory === cat ? 'white' : '#555' }}>
                {cat === 'all' ? (isRTL ? 'الكل' : 'Tout') : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products - FlatList للأداء */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={flatListData}
          keyExtractor={item => item.key}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>📦</Text>
              <Text style={{ color: '#777', marginTop: 10 }}>
                {isRTL ? 'لا توجد منتجات' : 'Aucun produit'}
              </Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#FF6B35" style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 8, textAlign: isRTL ? 'right' : 'left' }}>
                  {item.category}
                </Text>
              );
            }
            return (
              <ProductRow
                product={item}
                onPress={() => { setSelectedProduct(item); setQuantity(1); }}
                isRTL={isRTL}
                cartItems={cartItems}
                availableStock={availableStock}
                onQuickAdd={() => {
                  const pid = item._id || item.id;
                  const maxQty = availableStock[pid] !== undefined ? availableStock[pid] : Infinity;
                  const inCartQty = cartItems.find(i => i._id === pid)?.quantity || 0;
                  if (inCartQty + 1 > maxQty) {
                    Alert.alert(
                      isRTL ? 'كمية غير كافية' : 'Stock insuffisant',
                      isRTL ? `الكمية المتاحة: ${maxQty}` : `Quantité disponible: ${maxQty}`
                    );
                    return;
                  }
                  addToCart(item, 1, shop);
                }}
              />
            );
          }}
        />
      )}

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <Animated.View style={{
          position: 'absolute', bottom: 20, left: 16, right: 16,
          transform: [{ translateY: cartBarAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }],
        }}>
          <TouchableOpacity
            onPress={onOpenCart}
            style={{
              backgroundColor: '#FF6B35', borderRadius: 16, padding: 16,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
            }}
          >
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{cartCount}</Text>
            </View>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {isRTL ? 'عرض السلة' : 'Voir le panier'}
            </Text>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{cartTotal} MRU</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function ProductRow({ product, onPress, isRTL, cartItems, onQuickAdd, availableStock }) {
  const inCart = cartItems.find(i => i._id === (product._id || product.id));
  const imageUri = product.images?.[0] ? getMediaUrl(product.images[0]) : null;
  const pid = product._id || product.id;
  const stock = availableStock?.[pid];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white', borderRadius: 12, marginBottom: 10,
        flexDirection: isRTL ? 'row-reverse' : 'row', overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
      }}
    >
      {/* Image */}
      <View style={{ width: 100, height: 100, backgroundColor: 'white' }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 30 }}>🍽️</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#333', textAlign: isRTL ? 'right' : 'left' }} numberOfLines={2}>
          {product.name}
        </Text>
        {product.description && (
          <Text style={{ fontSize: 12, color: '#777', textAlign: isRTL ? 'right' : 'left' }} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        {stock !== undefined && stock < 10 && stock > 0 && (
          <Text style={{ fontSize: 11, color: '#e67e22', textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? `⚠️ متبقي: ${stock}` : `⚠️ Reste: ${stock}`}
          </Text>
        )}
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF6B35' }}>
            {product.price} MRU
          </Text>
          <TouchableOpacity
            onPress={onQuickAdd}
            style={{
              backgroundColor: inCart ? '#2C3E50' : '#FF6B35',
              borderRadius: 20, width: 32, height: 32,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {inCart ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
