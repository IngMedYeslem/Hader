/**
 * dbService.web.js — نسخة الويب فقط (localStorage، بدون expo-sqlite)
 * Metro يختار هذا الملف تلقائياً عند البناء للويب
 */

const TTL = {
  products: 2 * 60 * 60 * 1000,
  shops:    60 * 60 * 1000,
  offers:   30 * 60 * 1000,
  default:  15 * 60 * 1000,
};

const db = {
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
  remove: (key) => Promise.resolve(localStorage.removeItem(`hader:${key}`)),
  clear: () => {
    const toDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('hader:')) toDelete.push(k);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
    return Promise.resolve();
  },
};

const withCache = async (key, fn, ttl) => {
  const cached = db.get(key);
  if (cached !== null) return { data: cached, fromCache: true };
  const data = await fn();
  if (data) db.set(key, data, ttl ?? TTL.default);
  return { data, fromCache: false };
};

export { db, TTL, withCache };
