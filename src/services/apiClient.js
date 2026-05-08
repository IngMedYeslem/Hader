/**
 * apiClient.js
 * Client HTTP موحد يستخدم API_URL تلقائياً — يدعم fetch و axios
 */

import { API_CONFIG } from '../config/api';

const { BASE_URL, TIMEOUT } = API_CONFIG;

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const withTimeout = (promise, ms = TIMEOUT) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    ),
  ]);

/**
 * apiClient — بديل fetch مع BASE_URL تلقائي
 *
 * مثال:
 *   const data = await apiClient.get('/products');
 *   const res  = await apiClient.post('/auth/login', { email, password });
 */
export const apiClient = {
  get: (endpoint, options = {}) =>
    withTimeout(
      fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { ...defaultHeaders, ...options.headers },
        ...options,
      }).then(handleResponse)
    ),

  post: (endpoint, body, options = {}) =>
    withTimeout(
      fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { ...defaultHeaders, ...options.headers },
        body: JSON.stringify(body),
        ...options,
      }).then(handleResponse)
    ),

  put: (endpoint, body, options = {}) =>
    withTimeout(
      fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { ...defaultHeaders, ...options.headers },
        body: JSON.stringify(body),
        ...options,
      }).then(handleResponse)
    ),

  delete: (endpoint, options = {}) =>
    withTimeout(
      fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { ...defaultHeaders, ...options.headers },
        ...options,
      }).then(handleResponse)
    ),
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${error}`);
  }
  return res.json();
};

// ─── Axios Instance (اختياري — يُستخدم إذا كان axios مثبتاً) ─────────────────

let axiosInstance = null;

export const getAxiosInstance = () => {
  if (axiosInstance) return axiosInstance;

  try {
    const axios = require('axios');
    axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: defaultHeaders,
    });

    // Interceptor لتسجيل الأخطاء
    axiosInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        console.error('[Axios Error]', err.message);
        return Promise.reject(err);
      }
    );
  } catch (_) {
    console.warn('[apiClient] axios غير مثبت — استخدم apiClient.get/post بدلاً منه');
  }

  return axiosInstance;
};
