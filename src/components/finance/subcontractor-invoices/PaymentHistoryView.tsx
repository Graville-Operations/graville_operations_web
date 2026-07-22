'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { fetchSubcontractorInvoicePaymentHistory } from '@/lib/api/subcontractor-invoices';
import { formatKes } from '@/lib/utils/currency';
import type { PaymentHistorySummary } from '@/types/subcontractor-invoice';

interface PaymentHistoryViewProps {
  invoiceId: number;
  invoiceTotal: number;
  onBack: () => void;
}

export function PaymentHistoryView({ invoiceId, invoiceTotal, onBack }: PaymentHistoryViewProps) {
  const [history, setHistory] = useState<PaymentHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchSubcontractorInvoicePaymentHistory(invoiceId)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError('Failed to load payment history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Payment History</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Total Invoice Value
          </p>
          <p className="text-lg font-bold text-white">{formatKes(invoiceTotal)}</p>
        </div>
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Total Paid
          </p>
          <p className="text-lg font-bold text-white">
            {loading ? '—' : formatKes(history?.totalPaid ?? 0)}
          </p>
        </div>
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Remaining Balance
          </p>
          <p className="text-lg font-bold text-white">
            {loading ? '—' : formatKes(history?.remainingBalance ?? invoiceTotal)}
          </p>
        </div>
      </div>

      <div className="gv-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#33907C]">Payments</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#33907C]" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-10">{error}</p>
        ) : !history || history.payments.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-10">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {history.payments.map((p) => (
              <div key={p.id} className="flex justify-between items-start px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-white">{formatKes(p.amount)}</p>
                  {p.notes && <p className="text-xs text-white/40 mt-0.5">{p.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">{p.paymentDate}</p>
                  {p.recordedBy != null && (
                    <p className="text-xs text-white/30 mt-0.5">
                      Recorded by {p.recordedBy}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}