'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCompanyInvoice } from '@/lib/api/company-invoices';

export interface CompanyInvoiceItemForm {
  particulars: string;
  quantity: string;
  unit_price: string;
}

interface CompanyInvoiceFormFields {
  invoice_number: string;
  invoice_date: string;
  notes: string;
}

const emptyItem = (): CompanyInvoiceItemForm => ({ particulars: '', quantity: '', unit_price: '' });
const emptyForm = (): CompanyInvoiceFormFields => ({ invoice_number: '', invoice_date: '', notes: '' });

function validate(form: CompanyInvoiceFormFields, items: CompanyInvoiceItemForm[]): string | null {
  if (!form.invoice_number.trim()) return 'Invoice number is required.';
  if (!form.invoice_date) return 'Invoice date is required.';
  if (items.length === 0) return 'At least one item is required.';
  for (const [i, it] of items.entries()) {
    if (!it.particulars.trim()) return `Item ${i + 1}: particulars is required.`;
    if (!it.quantity || parseFloat(it.quantity) <= 0) return `Item ${i + 1}: quantity must be greater than 0.`;
    if (it.unit_price === '' || parseFloat(it.unit_price) < 0) return `Item ${i + 1}: unit price is required.`;
  }
  return null;
}

export function useCreateCompanyInvoiceForm() {
  const router = useRouter();

  const [form, setForm]             = useState<CompanyInvoiceFormFields>(emptyForm());
  const [items, setItems]           = useState<CompanyInvoiceItemForm[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const updateField = useCallback((field: keyof CompanyInvoiceFormFields, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  }, []);

  const updateItem = useCallback((idx: number, field: keyof CompanyInvoiceItemForm, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addItem = useCallback(() => setItems((p) => [...p, emptyItem()]), []);

  const removeItem = useCallback((idx: number) => {
    setItems((p) => p.filter((_, i) => i !== idx));
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0),
    [items]
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    const validationError = validate(form, items);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      invoice_number: form.invoice_number.trim(),
      invoice_date:   form.invoice_date,
      notes:          form.notes.trim() || null,
      items: items.map((it) => ({
        particulars: it.particulars.trim(),
        quantity:    parseFloat(it.quantity),
        unit_price:  parseFloat(it.unit_price),
      })),
    };

    try {
      setSubmitting(true);
      await createCompanyInvoice(payload);
      router.push('/finance/invoice/company');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ?? 'Failed to create invoice.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  }, [form, items, router]);

  return {
    form,
    updateField,
    items,
    updateItem,
    addItem,
    removeItem,
    totalAmount,
    submitting,
    error,
    handleSubmit,
    cancel: () => router.back(),
  };
}