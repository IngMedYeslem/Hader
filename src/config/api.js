const PRODUCTION_API_URL = 'https://hader.up.railway.app/api';

// عند تفعيل Cloudflare: ضع هنا نطاق الـ CDN الخاص بك
// مثال: 'https://cdn.hader.app'
// إذا تُركت فارغة، سيُستخدم نطاق الـ backend مباشرة
const CDN_URL = process.env.CDN_URL || '';

const BACKEND_ORIGIN = PRODUCTION_API_URL.replace('/api', '');

export const API_CONFIG = {
  BASE_URL: PRODUCTION_API_URL,
  // مهلة أطول تناسب الإنترنت البطيء في موريتانيا
  TIMEOUT: 15000,
};

export const API_URL = API_CONFIG.BASE_URL;

// يبني رابط الصورة: يستخدم CDN إن وُجد، وإلا يرجع لـ backend مباشرة
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (!path.startsWith('/uploads')) return path;
  const base = CDN_URL || BACKEND_ORIGIN;
  return `${base}${path}`;
};

if (__DEV__) console.log('[API] BASE_URL:', API_CONFIG.BASE_URL, '| CDN:', CDN_URL || 'غير مفعّل');
