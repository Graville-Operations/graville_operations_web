import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setInvoices: (invoices: InvoiceItem[]) => void;
  clearInvoices: () => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoices: [],
      isLoaded: false,
      setInvoices: (invoices) => set({ invoices, isLoaded: true }),
      clearInvoices: () => set({ invoices: [], isLoaded: false }),
    }),
    {
      name: 'graville_invoices',
      version: 2,
    }
  )
);