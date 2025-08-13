import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  return 'http://192.168.1.123:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000
};

console.log('API_URL:', API_CONFIG.BASE_URL);