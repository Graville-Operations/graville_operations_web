'use client';

import { useState } from 'react';
import { createSubcontractorInvoice } from '@/lib/api/subcontractor-invoices';
import {
  defaultInvoiceForm,
  emptyLineItem,
  type NewInvoiceForm,
  type NewLineItem,
} from '@/types/subcontractor-invoice';

export function useNewInvoiceForm(onSuccess: () => void) {
  const [form, setForm] = useState<NewInvoiceForm>(defaultInvoiceForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof NewInvoiceForm>(key: K, value: NewInvoiceForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setItem = (idx: number, key: keyof NewLineItem, value: string) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...f, items };
    });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyLineItem()] }));

  const removeItem = (idx: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const grandTotal = form.items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const submit = async () => {
    setError(null);

    if (!form.invoiceNo.trim()) return setError('Invoice number is required.');
    if (!form.contractorName.trim()) return setError('Contractor name is required.');
    if (!form.invoiceDate) return setError('Invoice date is required.');
    if (form.items.some((it) => !it.particulars.trim() || !it.quantity || !it.unitPrice))
      return setError('All line item fields are required.');

    const payload = {
      invoiceNo: form.invoiceNo.trim(),
      contractorName: form.contractorName.trim(),
      invoiceDate: form.invoiceDate,
      notes: form.notes.trim() || null,
      items: form.items.map((it, i) => ({
        index: i + 1,
        particulars: it.particulars.trim(),
        quantity: parseFloat(it.quantity),
        unitPrice: parseFloat(it.unitPrice),
        totalAmount: (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
      })),
    };

    try {
      setSubmitting(true);
      await createSubcontractorInvoice(payload);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to create invoice. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setField,
    setItem,
    addItem,
    removeItem,
    grandTotal,
    submitting,
    error,
    submit,
  };
}