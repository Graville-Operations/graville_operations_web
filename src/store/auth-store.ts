import { create } from 'zustand';
import { User } from '@/types';
import { saveToken, saveRole, saveUser, clearSession, getUser, getToken, getRole } from '@/lib/auth';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { useUserStore } from '@/store/user-store';
import { useMenuStore } from '@/store/menu-store';
import { useInvoiceStore } from '@/store/invoice-store';
import { useProfileStore } from '@/store/profile-store';

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
    const user  = getUser();
    const token = getToken();
    const role  = getRole();
    if (token && user) set({ user, token, role });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const loginRes = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const payload = loginRes.data?.data ?? loginRes.data;
      if (!payload?.token) throw new Error('Login failed — no token returned');

      const meRes = await axios.get(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${payload.token}` } }
      );
      const meData = meRes.data?.data ?? meRes.data;
      if (!meData || !meData.email) throw new Error('Failed to fetch user profile');

      const user: User = {
        ...meData,
        first_name:   meData.firstName ?? '',
        last_name:    meData.lastName  ?? '',
        account_type: meData.role      ?? '',
        phone_no: meData.phone ?? '',
        expires_at:   payload.expires_at ?? '', 
      };

      saveToken(payload.token);
      saveRole(payload.role);
      saveUser(user);
      set({ token: payload.token, role: payload.role, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null, role: null });

    useUserStore.getState().clearUsers();
    useMenuStore.getState().clearMenus();
    useInvoiceStore.getState().clearInvoices();
    useProfileStore.getState().clearProfile();
  },
}));