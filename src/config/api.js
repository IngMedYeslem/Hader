import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 3000;

// رابط الإنتاج — ضع هنا رابط الـ Backend بعد نشره على Railway/Render
const PRODUCTION_API_URL = 'https://YOUR_BACKEND_URL.railway.app/api';

const getDevServerIP = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost') return ip;
    }
  } catch (_) {}
  return null;
};

const buildBaseUrl = () => {
  // في الإنتاج (EAS build) استخدم الرابط الدائم
  if (!__DEV__) return PRODUCTION_API_URL;

  if (Platform.OS === 'web') return `http://localhost:${PORT}/api`;

  const ip = getDevServerIP();
  return ip ? `http://${ip}:${PORT}/api` : `http://localhost:${PORT}/api`;
};

export const API_CONFIG = {
  BASE_URL: buildBaseUrl(),
  TIMEOUT: 10000,
};

export const API_URL = API_CONFIG.BASE_URL;

export const getMediaUrl = (path) => {
  if (!path) return null;
  return path.startsWith('/uploads')
    ? `${API_CONFIG.BASE_URL.replace('/api', '')}${path}`
    : path;
};

if (__DEV__) console.log('[API] BASE_URL:', API_CONFIG.BASE_URL);
