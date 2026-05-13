import { create } from 'zustand';
import { User } from '@/types';
import { saveToken, saveRole, saveUser, clearSession, getUser, getToken, getRole } from '@/lib/auth';
import api from '@/lib/api';

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
    if (token && user) set({ user, token, role });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveToken(data.access_token);
      saveRole(data.account_type);

      // Fetch full profile
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      saveUser(meRes.data);

      set({
        token: data.access_token,
        role: data.account_type,
        user: meRes.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null, role: null });
  },
}));