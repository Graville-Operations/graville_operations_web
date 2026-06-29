import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface InvoiceItem {
  id: number;
  invoiceNo: string;
  clientName: string;
  total: number;
  invoiceDate: string;
  status?: string;
}

interface InvoiceStore {
  invoices: InvoiceItem[];
  isLoaded: boolean;
  lastFetched: number | null;
  setInvoices: (invoices: InvoiceItem[]) => void;
  clearInvoices: () => void;
  refresh: () => Promise<void>;
  startPolling: () => () => void;
}

const POLL_INTERVAL_MS = 30_000; // poll every 30 seconds

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      isLoaded: false,
      lastFetched: null,

      setInvoices: (invoices) => set({ invoices, isLoaded: true, lastFetched: Date.now() }),

      clearInvoices: () => set({ invoices: [], isLoaded: false, lastFetched: null }),

      refresh: async () => {
        try {
          const { data } = await api.get('/client-invoices/all?limit=5');
          const payload = data?.data ?? data;
          const list: InvoiceItem[] = Array.isArray(payload)
            ? payload
            : payload?.items ?? payload?.results ?? [];
          set({ invoices: list, isLoaded: true, lastFetched: Date.now() });
        } catch (err) {
          console.error('[InvoiceStore] refresh failed:', err);
        }
      },

      startPolling: () => {
        // Fetch immediately on start
        get().refresh();

        const interval = setInterval(() => {
          get().refresh();
        }, POLL_INTERVAL_MS);

        // Return cleanup function to stop polling
        return () => clearInterval(interval);
      },
    }),
    {
      name: 'graville_invoices',
      version: 2,
      partialize: (state) => ({
        invoices: state.invoices,
        isLoaded: state.isLoaded,
        lastFetched: state.lastFetched,
      }),
    }
  )
);