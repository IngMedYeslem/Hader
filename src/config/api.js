import { Platform } from 'react-native';

// Configuration centralisée des URLs API
const API_URLS = {
  LOCAL_IP: '192.168.0.110:3000/api',
  LOCALHOST: 'localhost:3000/api'
};

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return `http://${API_URLS.LOCALHOST}`;
  }
  return `http://${API_URLS.LOCAL_IP}`;
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000,
  FALLBACK_URL: Platform.OS === 'web' ? `http://${API_URLS.LOCAL_IP}` : `http://${API_URLS.LOCALHOST}`
};

export const API_URL = getApiUrl();

console.log('API_URL:', API_CONFIG.BASE_URL);
console.log('FALLBACK_URL:', API_CONFIG.FALLBACK_URL);