import { Platform } from 'react-native';

// تسجيل Service Worker على الويب فقط
export const registerServiceWorker = async () => {
  if (Platform.OS !== 'web') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] تحديث متاح — أعد تحميل الصفحة للحصول على النسخة الجديدة');
        }
      });
    });
    console.log('[PWA] Service Worker مسجّل بنجاح');
  } catch (err) {
    console.warn('[PWA] فشل تسجيل Service Worker:', err.message);
  }
};

// طلب إضافة التطبيق للشاشة الرئيسية
let deferredPrompt = null;

export const setupInstallPrompt = () => {
  if (Platform.OS !== 'web') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
};

export const promptInstall = async () => {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
};

export const isInstalled = () =>
  Platform.OS === 'web' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true);
