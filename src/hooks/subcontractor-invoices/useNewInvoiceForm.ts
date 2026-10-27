'use client';

import { useEffect, useState } from 'react';
import { createSubcontractorInvoice } from '@/lib/api/subcontractor-invoices';
import { useSiteStore } from '@/store/site-store';
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

  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.isLoading);
  const fetchSitesAction = useSiteStore((s) => s.fetchSites);

  useEffect(() => {
    fetchSitesAction(); // no-op while the shared sites cache already holds the list
  }, [fetchSitesAction]);

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
    if (!form.siteId) return setError('Please select a site.');
    if (!form.invoiceDate) return setError('Invoice date is required.');
    if (form.items.some((it) => !it.particulars.trim() || !it.quantity || !it.unitPrice))
      return setError('All line item fields are required.');
    if (form.items.some((it) => !(parseFloat(it.quantity) > 0)))
      return setError('Each line item quantity must be greater than 0.');

    const payload = {
      invoice_number: form.invoiceNo.trim(),
      contractor_name: form.contractorName.trim(),
      site_id: Number(form.siteId),
      invoice_date: form.invoiceDate,
      notes: form.notes.trim() || null,
      items: form.items.map((it, i) => ({
        index: i + 1,
        particulars: it.particulars.trim(),
        quantity: parseFloat(it.quantity),
        unit_price: parseFloat(it.unitPrice),
        total_amount: (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
      })),
    };

    try {
      setSubmitting(true);
      await createSubcontractorInvoice(payload);
      onSuccess();
    } catch (err: any) {
      // The API client turns a body-level error code into a plain Error, so the
      // server's message lives on err.message (not err.response) in that case.
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
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
    sites,
    sitesLoading,
    submitting,
    error,
    submit,
  };
}