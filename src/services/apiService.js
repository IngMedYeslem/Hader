import { API_CONFIG } from '../config/api';
import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = API_CONFIG.BASE_URL;

// ─── مدد الـ Cache ────────────────────────────────────────────────────────────
// مدة طويلة تناسب الإنترنت البطيء في موريتانيا
const CACHE_TTL         = 2  * 60 * 60 * 1000; // 2 ساعة  — المنتجات
const SHOP_CACHE_TTL    = 30 * 60 * 1000;       // 30 دقيقة — منتجات المتجر
const SHOPS_CACHE_TTL   = 60 * 60 * 1000;       // ساعة     — قائمة المتاجر

const KEYS = {
  products:       'cache:products',
  productsTs:     'cache:products:ts',
  shops:          'cache:shops',
  shopsTs:        'cache:shops:ts',
  shopProducts:   (id, page) => `cache:shop:${id}:${page}`,
  shopProductsTs: (id, page) => `cache:shop:${id}:${page}:ts`,
};

// ─── أدوات Cache عامة ─────────────────────────────────────────────────────────
const storage = {
  get: (key) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : AsyncStorage.getItem(key),

  set: (key, value) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : AsyncStorage.setItem(key, value),

  remove: (key) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : AsyncStorage.removeItem(key),
};

/**
 * يقرأ من الـ cache.
 * يُرجع { data, isStale } حيث isStale=true إذا انتهت المدة لكن البيانات موجودة.
 */
const readCache = async (dataKey, tsKey, ttl) => {
  try {
    const [raw, ts] = await Promise.all([storage.get(dataKey), storage.get(tsKey)]);
    if (!raw || !ts) return null;
    const age = Date.now() - parseInt(ts);
    return { data: JSON.parse(raw), isStale: age >= ttl };
  } catch {
    return null;
  }
};

const writeCache = async (dataKey, tsKey, data) => {
  try {
    await Promise.all([
      storage.set(dataKey, JSON.stringify(data)),
      storage.set(tsKey, Date.now().toString()),
    ]);
  } catch (e) {
    console.warn('تعذّر حفظ الـ cache:', e.message);
  }
};

// ─── فحص الاتصال ─────────────────────────────────────────────────────────────
const checkConnectivity = async () => {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
};

// ─── تحويل بيانات الخادم إلى الشكل المطلوب ───────────────────────────────────
const mapProduct = (p, shop = null) => ({
  id: p._id,
  _id: p._id,
  name: p.name,
  description: p.description,
  price: p.price,
  category: p.category,
  stock: p.stock ?? 0,
  images: (p.images || []).slice(0, 3),
  shop: shop
    ? {
        _id: shop._id,
        id: shop._id,
        username: shop.name,
        name: shop.name,
        phone: shop.phone,
        whatsapp: shop.whatsapp,
        email: shop.email,
        address: shop.address,
        profileImage: shop.profileImage || null,
        mainImage: shop.mainImage || null,
        coverImage: shop.mainImage || shop.coverImage || null,
        category: shop.category || '',
        isApproved: shop.isApproved || false,
        bankAccounts: shop.bankAccounts || [],
      }
    : (p.shop || null),
});

// ─── جلب المنتجات مع المتاجر (يُحلّ مشكلة N+1) ─────────────────────────────
export const fetchProductsWithShops = async (forceRefresh = false) => {
  // 1. قراءة الـ cache
  if (!forceRefresh) {
    const cached = await readCache(KEYS.products, KEYS.productsTs, CACHE_TTL);
    if (cached && !cached.isStale) {
      console.log('📱 cache حديث — تحميل فوري بدون إنترنت');
      return cached.data;
    }
    // بيانات منتهية المدة: نُرجعها فوراً ونحدّث في الخلفية
    if (cached?.isStale) {
      console.log('♻️ cache قديم — عرض البيانات + تحديث في الخلفية');
      _refreshProductsBackground();
      return cached.data;
    }
  }

  // 2. فحص الاتصال
  const online = await checkConnectivity();
  if (!online) {
    console.log('📵 لا اتصال — استخدام آخر cache متاح');
    const stale = await readCache(KEYS.products, KEYS.productsTs, Infinity);
    return stale?.data || [];
  }

  return await _fetchAndCacheProducts();
};

// جلب وكتابة cache في الخلفية (لا ينتظره المستخدم)
const _refreshProductsBackground = async () => {
  try {
    await _fetchAndCacheProducts();
    console.log('✅ تحديث خلفي للمنتجات اكتمل');
  } catch (e) {
    console.warn('تعذّر التحديث الخلفي:', e.message);
  }
};

const _fetchAndCacheProducts = async () => {
  // جلب المنتجات
  const products = await apiClient.get('/debug/products');
  const limited = products.slice(0, 100);

  // جمع معرّفات المتاجر الفريدة — استعلام واحد بدل N استعلام
  const shopIds = [...new Set(limited.map(p => p.shopId).filter(Boolean))];
  const shopsMap = await _fetchShopsMap(shopIds);

  const result = limited.map(p => mapProduct(p, p.shopId ? shopsMap[p.shopId] : null));

  await writeCache(KEYS.products, KEYS.productsTs, result);
  console.log(`✅ ${result.length} منتج مخزّن في الـ cache`);
  return result;
};

// جلب المتاجر كـ map { id → shop } — استعلام واحد أو جلب بالجملة
const _fetchShopsMap = async (shopIds) => {
  const map = {};

  // أولاً: محاولة جلب كل المتاجر دفعة واحدة من الـ cache
  const shopsCache = await readCache(KEYS.shops, KEYS.shopsTs, SHOPS_CACHE_TTL);
  if (shopsCache && !shopsCache.isStale) {
    shopsCache.data.forEach(s => { map[s._id] = s; });
    if (shopIds.every(id => map[id])) {
      console.log('🏪 متاجر من cache');
      return map;
    }
  }

  // جلب كل المتاجر المطلوبة بالتوازي (أسرع من واحد واحد)
  const fetched = await Promise.allSettled(
    shopIds.map(id => apiClient.get(`/shops/${id}`))
  );
  const allShops = [];
  fetched.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value) {
      map[shopIds[i]] = res.value;
      allShops.push(res.value);
    }
  });

  // تخزين المتاجر في cache منفصل
  if (allShops.length) {
    await writeCache(KEYS.shops, KEYS.shopsTs, allShops);
  }

  return map;
};

// ─── منتجات متجر محدد ────────────────────────────────────────────────────────
export const fetchProductsByShop = async (shopId, page = 1, limit = 20) => {
  const dataKey = KEYS.shopProducts(shopId, page);
  const tsKey   = KEYS.shopProductsTs(shopId, page);

  const cached = await readCache(dataKey, tsKey, SHOP_CACHE_TTL);
  if (cached && !cached.isStale) return cached.data;

  const online = await checkConnectivity();
  if (!online) return cached?.data || [];

  try {
    let products = [];
    try {
      products = await apiClient.get(`/products/shop/${shopId}?page=${page}&limit=${limit}`);
    } catch {
      const all = await apiClient.get('/debug/products');
      products = all
        .filter(p => p.shopId === shopId || p.shop?._id === shopId)
        .slice((page - 1) * limit, page * limit);
    }

    const result = products.map(p => mapProduct(p));
    await writeCache(dataKey, tsKey, result);
    return result;
  } catch (error) {
    console.error('fetchProductsByShop error:', error);
    return cached?.data || [];
  }
};

// ─── فحص الخادم ──────────────────────────────────────────────────────────────
export const checkServerHealth = async () => checkConnectivity();

// ─── مسح الـ cache ────────────────────────────────────────────────────────────
export const clearProductsCache = async () => {
  await Promise.all([
    storage.remove(KEYS.products),
    storage.remove(KEYS.productsTs),
    storage.remove(KEYS.shops),
    storage.remove(KEYS.shopsTs),
  ]);
  console.log('🗑️ cache المنتجات والمتاجر مُمسح');
};
