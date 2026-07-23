'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSubcontractorInvoiceDetail } from '@/lib/api/subcontractor-invoices';
import type { SubcontractorInvoiceDetail, SubcontractorInvoiceListItem } from '@/types/subcontractor-invoice';

function fromListItem(item: SubcontractorInvoiceListItem): SubcontractorInvoiceDetail {
  return {
    id:              item.id,
    invoiceNo:       item.invoiceNo,
    contractorName:  item.contractorName,
    invoiceDate:     item.invoiceDate,
    notes:           null,
    createdBy:       item.createdBy ?? { name: '', email: '', phone: '' },
    total:           item.total,
    created_at:      item.createdAt,
    items:           [],
    paymentStatus:   item.paymentStatus,
  };
}

export function useSubcontractorInvoiceDetail(
  invoiceId: number,
  initialData?: SubcontractorInvoiceListItem,
) {
  const [invoice, setInvoice] = useState<SubcontractorInvoiceDetail | null>(
    initialData ? fromListItem(initialData) : null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [hasFullDetail, setHasFullDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setDetailLoading(true);
    setError(null);
    try {
      const data = await fetchSubcontractorInvoiceDetail(id);
      setInvoice(data);
      setHasFullDetail(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoice details.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasFullDetail(false);
    load(invoiceId);
  }, [invoiceId, load]);

  return { invoice, detailLoading, hasFullDetail, error, retry: () => load(invoiceId) };
}