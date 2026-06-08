import { API_CONFIG } from '../config/api';
import { apiClient } from './apiClient';
import { db, TTL as DB_TTL } from './dbService';

const API_BASE_URL = API_CONFIG.BASE_URL;

// ─── مدد الـ Cache (SQLite) ───────────────────────────────────────────────────
const CACHE_TTL      = DB_TTL.products; // 2 ساعة — المنتجات
const SHOP_CACHE_TTL = DB_TTL.offers;   // 30 دقيقة — منتجات المتجر
const SHOPS_CACHE_TTL = DB_TTL.shops;  // ساعة — قائمة المتاجر

const KEYS = {
  products:     'products',
  shops:        'shops',
  shopProducts: (id, page) => `shop:${id}:${page}`,
};

// ─── أدوات Cache (SQLite / localStorage) ─────────────────────────────────────
const readCache = async (key, ttl) => {
  try {
    const data = await db.get(key);
    if (!data) return null;
    // نُرجع دائماً البيانات مع علامة isStale=false لأن dbService يحذف المنتهية تلقائياً
    return { data, isStale: false };
  } catch {
    return null;
  }
};

const writeCache = async (key, data, ttl) => {
  try {
    await db.set(key, data, ttl);
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
  // 1. قراءة الـ cache الحديث (SQLite بدل AsyncStorage)
  if (!forceRefresh) {
    const cached = await readCache(KEYS.products, CACHE_TTL);
    if (cached) {
      console.log('📱 cache حديث — تحميل فوري بدون إنترنت');
      return cached.data;
    }
  }

  // 2. فحص الاتصال
  const online = await checkConnectivity();
  if (!online) {
    // نجرّب النسخة الاحتياطية طويلة الأمد
    console.log('📵 لا اتصال — استخدام آخر cache متاح');
    const backup = await db.get(KEYS.products + ':backup');
    return backup || [];
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
  const products = await apiClient.get('/debug/products');
  const limited = products.slice(0, 100);

  const shopIds = [...new Set(limited.map(p => p.shopId).filter(Boolean))];
  const shopsMap = await _fetchShopsMap(shopIds);

  const result = limited.map(p => mapProduct(p, p.shopId ? shopsMap[p.shopId] : null));

  await writeCache(KEYS.products, result, CACHE_TTL);
  // نسخة احتياطية طويلة الأمد للاستخدام offline (30 يوم)
  await db.set(KEYS.products + ':backup', result, 30 * 24 * 60 * 60 * 1000);
  console.log(`✅ ${result.length} منتج مخزّن في الـ cache (SQLite)`);
  return result;
};

// جلب المتاجر كـ map { id → shop } — استعلام واحد أو جلب بالجملة
const _fetchShopsMap = async (shopIds) => {
  const map = {};

  const shopsCache = await readCache(KEYS.shops, SHOPS_CACHE_TTL);
  if (shopsCache) {
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

  if (allShops.length) {
    await writeCache(KEYS.shops, allShops, SHOPS_CACHE_TTL);
  }

  return map;
};

// ─── منتجات متجر محدد ────────────────────────────────────────────────────────
export const fetchProductsByShop = async (shopId, page = 1, limit = 20) => {
  const dataKey = KEYS.shopProducts(shopId, page);

  const cached = await readCache(dataKey, SHOP_CACHE_TTL);
  if (cached) return cached.data;

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
    await writeCache(dataKey, result, SHOP_CACHE_TTL);
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
    db.remove(KEYS.products),
    db.remove(KEYS.shops),
  ]);
  console.log('🗑️ cache المنتجات والمتاجر مُمسح');
};
