// lib/api.ts
import axios from 'axios';
import { API_BASE_URL } from './constants';
import { getToken, clearSession } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'code' in body && !body.data) {
      return Promise.reject(new Error(body.message || 'Something went wrong'));
    }
    return res;
  },
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/verify-otp');

    if (error.response?.status === 401 && !isAuthRoute) {
      clearSession();
      if (typeof window !== 'undefined') window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;