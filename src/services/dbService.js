/**
 * dbService.js — تخزين مؤقت باستخدام SQLite (على الموبايل) وlocalStorage (على الويب)
 *
 * مزايا SQLite مقارنة بـ AsyncStorage:
 * - استعلامات SQL أسرع على البيانات الكبيرة
 * - تخزين منظّم ويدعم الفهرسة
 * - يعمل بشكل كامل بدون إنترنت
 */

import { Platform } from 'react-native';

// ─── TTL الافتراضية ───────────────────────────────────────────────────────────
const TTL = {
  products: 2 * 60 * 60 * 1000,       // 2 ساعة
  shops:    60 * 60 * 1000,            // ساعة
  offers:   30 * 60 * 1000,            // 30 دقيقة
  default:  15 * 60 * 1000,            // 15 دقيقة
};

// ─── طبقة الويب (localStorage) ──────────────────────────────────────────────
const webDB = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`hader:${key}`);
      if (!item) return null;
      const { data, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        localStorage.removeItem(`hader:${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },
  set: (key, data, ttl = TTL.default) => {
    try {
      localStorage.setItem(`hader:${key}`, JSON.stringify({
        data,
        expires: Date.now() + ttl,
      }));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // حذف أقدم المدخلات عند امتلاء التخزين
        const toDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith('hader:')) toDelete.push(k);
        }
        toDelete.slice(0, Math.ceil(toDelete.length / 2)).forEach(k => localStorage.removeItem(k));
        localStorage.setItem(`hader:${key}`, JSON.stringify({ data, expires: Date.now() + ttl }));
      }
    }
  },
  remove: (key) => localStorage.removeItem(`hader:${key}`),
  clear: () => {
    const toDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('hader:')) toDelete.push(k);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
  },
};

// ─── طبقة SQLite (Expo) ──────────────────────────────────────────────────────
let sqliteDB = null;

const initSQLite = async () => {
  if (sqliteDB) return sqliteDB;
  try {
    const { openDatabaseAsync } = require('expo-sqlite');
    sqliteDB = await openDatabaseAsync('hader_cache.db');
    await sqliteDB.execAsync(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        expires INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_expires ON cache(expires);
    `);
    // حذف المدخلات المنتهية الصلاحية عند الفتح
    await sqliteDB.runAsync('DELETE FROM cache WHERE expires < ?', [Date.now()]);
    return sqliteDB;
  } catch (e) {
    console.warn('[dbService] SQLite غير متاح، سيستخدم AsyncStorage:', e.message);
    return null;
  }
};

const nativeDB = {
  get: async (key) => {
    try {
      const db = await initSQLite();
      if (!db) return fallbackAsyncGet(key);
      const row = await db.getFirstAsync(
        'SELECT value, expires FROM cache WHERE key = ?', [key]
      );
      if (!row) return null;
      if (Date.now() > row.expires) {
        await db.runAsync('DELETE FROM cache WHERE key = ?', [key]);
        return null;
      }
      return JSON.parse(row.value);
    } catch {
      return null;
    }
  },
  set: async (key, data, ttl = TTL.default) => {
    try {
      const db = await initSQLite();
      if (!db) return fallbackAsyncSet(key, data, ttl);
      await db.runAsync(
        'INSERT OR REPLACE INTO cache (key, value, expires) VALUES (?, ?, ?)',
        [key, JSON.stringify(data), Date.now() + ttl]
      );
    } catch (e) {
      console.warn('[dbService] خطأ في الكتابة:', e.message);
    }
  },
  remove: async (key) => {
    try {
      const db = await initSQLite();
      if (!db) return;
      await db.runAsync('DELETE FROM cache WHERE key = ?', [key]);
    } catch {}
  },
  clear: async () => {
    try {
      const db = await initSQLite();
      if (!db) return;
      await db.runAsync('DELETE FROM cache');
    } catch {}
  },
};

// ─── Fallback: AsyncStorage ─────────────────────────────────────────────────
const fallbackAsyncGet = async (key) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const item = await AsyncStorage.getItem(`hader:${key}`);
    if (!item) return null;
    const { data, expires } = JSON.parse(item);
    if (Date.now() > expires) { await AsyncStorage.removeItem(`hader:${key}`); return null; }
    return data;
  } catch { return null; }
};
const fallbackAsyncSet = async (key, data, ttl) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(`hader:${key}`, JSON.stringify({ data, expires: Date.now() + ttl }));
  } catch {}
};

// ─── الواجهة الموحّدة ────────────────────────────────────────────────────────
export const db = Platform.OS === 'web' ? webDB : nativeDB;

export { TTL };

// ─── دوال مساعدة ─────────────────────────────────────────────────────────────

/** يجلب من الـ cache أو ينفّذ fn ثم يخزّن النتيجة */
export const withCache = async (key, fn, ttl) => {
  const cached = await db.get(key);
  if (cached !== null) return { data: cached, fromCache: true };
  const data = await fn();
  if (data) await db.set(key, data, ttl ?? TTL.default);
  return { data, fromCache: false };
};
