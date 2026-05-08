import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 3000;

/**
 * استخراج IP جهاز التطوير تلقائياً من Expo
 * hostUri مثال: "192.168.1.5:8081"
 */
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
  if (Platform.OS === 'web') return `http://localhost:${PORT}/api`;

  const ip = getDevServerIP();
  return ip ? `http://${ip}:${PORT}/api` : `http://localhost:${PORT}/api`;
};

export const API_CONFIG = {
  BASE_URL: buildBaseUrl(),
  TIMEOUT: 10000,
};

export const API_URL = API_CONFIG.BASE_URL;

/** رابط الوسائط (صور / فيديو) */
export const getMediaUrl = (path) => {
  if (!path) return null;
  return path.startsWith('/uploads')
    ? `${API_CONFIG.BASE_URL.replace('/api', '')}${path}`
    : path;
};

console.log('[API] BASE_URL:', API_CONFIG.BASE_URL);
