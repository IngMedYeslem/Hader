const PRODUCTION_API_URL = 'https://hader-backend-production.up.railway.app/api';

export const API_CONFIG = {
  BASE_URL: PRODUCTION_API_URL,
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
