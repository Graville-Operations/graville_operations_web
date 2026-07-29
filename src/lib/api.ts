// src/lib/api.ts
import axios from 'axios';
import { API_BASE_URL } from './constants';
import { API } from './endpoints';
import { ROUTES } from './routes';
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
    if (body && typeof body === 'object' && 'code' in body) {
      const code = Number(body.code);
      if (!Number.isNaN(code) && code >= 400) {
        return Promise.reject(new Error(body.message || 'Something went wrong'));
      }
    }
    return res;
  },
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthRoute = url.includes(API.auth.login) || url.includes(API.auth.verifyOtp);

    if (error.response?.status === 401 && !isAuthRoute) {
      clearSession();
      if (typeof window !== 'undefined') window.location.href = ROUTES.signin;
    }
    return Promise.reject(error);
  }
);

export default api;