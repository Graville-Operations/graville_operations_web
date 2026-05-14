import axios from 'axios';
import { API_BASE_URL } from './constants';
import { getToken, clearSession } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;