'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Site } from '@/types';
import { ClientInvoiceItemDraft, NewClientInvoiceForm } from '@/types/client-invoice';
import { fetchSites, createClientInvoice } from '@/lib/api/client-invoices';
import { todayISO } from '@/lib/utils/date';

const emptyItem = (): ClientInvoiceItemDraft => ({
  particulars: '',
  quantity: '',
  unit_price: '',
});

export function useNewClientInvoiceForm() {
  const router = useRouter();
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const today = todayISO();

  const [form, setForm] = useState<NewClientInvoiceForm>({
    invoice_number: '',
    invoice_date: today,
    client_name: '',
    site_id: '',
    notes: '',
  });
  const [items, setItems] = useState<ClientInvoiceItemDraft[]>([emptyItem()]);

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setSitesLoading(false));
  }, []);

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto';
      notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
    }
  }, [form.notes]);

  const updateField = (key: keyof NewClientInvoiceForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index: number, field: keyof ClientInvoiceItemDraft, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getLineTotal = (item: ClientInvoiceItemDraft) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return qty * price;
  };

  const grandTotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const item of items) {
      if (!item.particulars || !item.quantity || !item.unit_price) {
        setError('All line items must have particulars, quantity and unit price');
        return;
      }
    }

    setIsLoading(true);
    try {
      await createClientInvoice(form, items);
      router.push('/finance/invoice/client');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(
        e.response?.data?.message ||
        e.response?.data?.detail ||
        'Failed to create invoice'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notesRef, sites, sitesLoading, isLoading, error, today,
    form, updateField, items, updateItem, addItem, removeItem,
    getLineTotal, grandTotal, handleSubmit,
  };
}