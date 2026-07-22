'use client';

import { useEffect } from 'react';
import { ChevronLeft, StickyNote } from 'lucide-react';
import { useSubcontractorInvoiceDetail } from '@/hooks/subcontractor-invoices/useSubcontractorInvoiceDetail';
import { formatKes } from '@/lib/utils/currency';
import { Field } from './Field';

interface InvoiceDetailViewProps {
  invoiceId: number;
  onBack: () => void;
}

export function InvoiceDetailView({ invoiceId, onBack }: InvoiceDetailViewProps) {
  const { invoice, loading, error, retry } = useSubcontractorInvoiceDetail(invoiceId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft size={16} />
          </div>
          <span>Back to Invoices</span>
        </button>

        {invoice && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Invoice {invoice.invoiceNo}</h2>
            <p className="text-sm text-white/40">{invoice.contractorName}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={retry}
            className="text-xs bg-white/10 border border-white/20 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors text-white/70"
          >
            Retry
          </button>
        </div>
      )}

      {invoice && !loading && (
        <>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 pb-3 border-b border-white/10 mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-5">
                <Field label="Invoice No.">{invoice.invoiceNo}</Field>
                <Field label="Invoice Date">{invoice.invoiceDate}</Field>
                <Field label="Contractor">{invoice.contractorName}</Field>
                <Field label="Total (KES)">
                  <span className="text-[#33907C] font-bold">{formatKes(invoice.total)}</span>
                </Field>
                <Field label="Created At">{invoice.created_at}</Field>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
                Submitted By
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#33907C]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#33907C] font-bold text-lg">
                    {invoice.createdBy.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-white">{invoice.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Email
                    </p>
                    <p className="text-sm text-blue-400">{invoice.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm text-white/60">{invoice.createdBy.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-white/40" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
              </div>
              <p className="text-sm text-white/60 italic leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Line Items — {invoice.items.length} entries
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40
                          ${i >= 2 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white/30 w-10">{item.index}</td>
                      <td className="px-6 py-4 text-sm text-white">{item.particulars}</td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                        {formatKes(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#33907C] text-right tabular-nums">
                        {formatKes(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5 border-t border-white/20">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/50"
                    >
                      Grand Total
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-[#33907C] tabular-nums">
                      KES {formatKes(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}