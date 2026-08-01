import { create } from 'zustand';
import { User } from '@/types/users';
import {
  saveToken, saveRole, saveUser, saveExpiresAt,
  getUser, getToken, getRole,
} from '@/lib/auth';
import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { useSiteStore } from '@/store/site-store';
import { clearData } from '@/lib/clear-data';

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  isLoading: false,

  loadFromStorage: () => {
    const user = getUser();
    const token = getToken();
    const role = getRole();
    if (token && user) {
      set({ user, token, role });
      useSiteStore.getState().fetchSites();
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const loginRes = await api.post(API.auth.login, { email, password });
      const body = loginRes.data;

      if (!body?.data) {
        throw new Error(body?.message || 'Login failed');
      }

      const payload = body.data;

      if (!payload?.token) {
        throw new Error(body?.message || 'Login failed — no token returned');
      }

      const meRes = await api.get(API.auth.me, {
        headers: { Authorization: `Bearer ${payload.token}` },
      });

      const meBody = meRes.data;
      const meData = meBody?.data;

      if (!meData || !meData.email) {
        throw new Error(meBody?.message || 'Failed to fetch user profile');
      }

      const user: User = {
        ...meData,
        first_name: meData.firstName ?? '',
        last_name: meData.lastName ?? '',
        account_type: meData.role ?? '',
        phone_no: meData.phone ?? '',
        expires_at: payload.expires_at ?? '',
      };

      saveToken(payload.token);
      saveRole(payload.role);
      saveUser(user);
      saveExpiresAt(payload.expires_at ?? '');

      set({
        token: payload.token,
        role: payload.role,
        user,
        isLoading: false,
      });

      useSiteStore.getState().fetchSites();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearData();
    set({ user: null, token: null, role: null });
  },
}));