import { create } from 'zustand';

interface NetworkState {
  isNetworkError: boolean;
  message: string | null;
  setNetworkError: (message?: string) => void;
  clearNetworkError: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isNetworkError: false,
  message: null,
  setNetworkError: (message) =>
    set({
      isNetworkError: true,
      message: message ?? 'Network error. Check your internet connection.',
    }),
  clearNetworkError: () => set({ isNetworkError: false, message: null }),
}));