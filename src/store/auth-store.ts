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

      // API returns: { code, data: { token, role, user_id, expires_at }, message }
      const payload = data?.data ?? data;

      saveToken(payload.token);  
      saveRole(payload.role);    

      // Fetch full user profile
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${payload.token}` },
      });

      const user = meRes.data?.data ?? meRes.data;

      saveUser(user);
      set({
        token: payload.token,  
        role: payload.role,    
        user,
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