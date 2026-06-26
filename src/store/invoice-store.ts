import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InvoiceItem {
  id: number;
  invoice_number: string;
  client_name: string;
  total_invoice_value: number;
  invoice_date: string;
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
    { name: 'graville_invoices' }
  )
);