import { create } from 'zustand';
import { User } from '@/types';
import {
  saveToken, saveRole, saveUser, saveExpiresAt,
  clearSession, getUser, getToken, getRole,
} from '@/lib/auth';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

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
    // Step 1: Login — plain axios to bypass interceptor
    const loginRes = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const body = loginRes.data; // { code, data, message }

    // Backend always returns HTTP 200, even on failure —
    // success is signaled by `data` being non-null, not by status code.
    if (!body?.data) {
      throw new Error(body?.message || 'Login failed');
    }

    const payload = body.data;

    if (!payload?.token) {
      throw new Error(body?.message || 'Login failed — no token returned');
    }

    // Step 2: Fetch profile using fresh token — plain axios again
    const meRes = await axios.get(
      `${API_BASE_URL}/auth/me`,
      { headers: { Authorization: `Bearer ${payload.token}` } }
    );

    const meBody = meRes.data;
    const meData = meBody?.data;

    if (!meData || !meData.email) {
      throw new Error(meBody?.message || 'Failed to fetch user profile');
    }

    // Map camelCase API fields → snake_case User type
    const user: User = {
      ...meData,
      first_name:   meData.firstName  ?? '',
      last_name:    meData.lastName   ?? '',
      account_type: meData.role       ?? '',
      phone_no:     meData.phone      ?? '',
      expires_at:   payload.expires_at ?? '',
    };

    // Step 3: Save everything — token, role, full user, and separate expiry cookie
    saveToken(payload.token);
    saveRole(payload.role);
    saveUser(user);
    saveExpiresAt(payload.expires_at ?? '');

    set({
      token: payload.token,
      role:  payload.role,
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