'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { fetchSubcontractorInvoicePaymentHistory } from '@/lib/api/subcontractor-invoices';
import { formatKes } from '@/lib/utils/currency';
import type { PaymentHistorySummary } from '@/types/subcontractor-invoice';
import EmptyState from '@/components/ui/emptystate';
import { PulseLine } from '@/components/shared/Shimmer';

interface PaymentHistoryViewProps {
  invoiceId: number;
  onBack: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAccessDeniedError(err: any): boolean {
  const status = err?.response?.status ?? err?.status;
  if (status === 403 || status === 401) return true;
  const msg = String(err?.message ?? err ?? '').toLowerCase();
  return /403|forbidden|permission|access denied/.test(msg);
}

export function PaymentHistoryView({ invoiceId, onBack }: PaymentHistoryViewProps) {
  const [history, setHistory] = useState<PaymentHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setAccessDenied(false);
    fetchSubcontractorInvoicePaymentHistory(invoiceId)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        if (isAccessDeniedError(err)) {
          setAccessDenied(true);
        } else {
          setError('Failed to load payment history.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const backButton = (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>
      <h2 className="text-xl font-bold text-white">Payment History</h2>
    </div>
  );

  if (accessDenied) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          title="Access Denied"
          description="Only Finance can view this invoice's payment history."
          fullScreen={false}
        />
      </div>
    );
  }

  if (error && !history) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          title="Unable to Load Payment History"
          description={error}
          fullScreen={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backButton}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Total Invoice Value
          </p>
          {loading ? (
            <PulseLine w="100px" h="20px" />
          ) : (
            <p className="text-lg font-bold text-white">{formatKes(history?.totalInvoiceValue ?? 0)}</p>
          )}
        </div>
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Total Paid
          </p>
          {loading ? (
            <PulseLine w="100px" h="20px" />
          ) : (
            <p className="text-lg font-bold text-white">{formatKes(history?.totalPaid ?? 0)}</p>
          )}
        </div>
        <div className="gv-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#33907C] mb-2">
            Remaining Balance
          </p>
          {loading ? (
            <PulseLine w="100px" h="20px" />
          ) : (
            <p className="text-lg font-bold text-white">{formatKes(history?.remainingBalance ?? 0)}</p>
          )}
        </div>
      </div>

      <div className="gv-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#33907C]">Payments</h3>
        </div>

        {loading ? (
          <div className="divide-y divide-white/10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-start px-6 py-4">
                <div className="space-y-2">
                  <PulseLine w="100px" h="14px" />
                  <PulseLine w="160px" h="11px" />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <PulseLine w="80px" h="11px" />
                  <PulseLine w="110px" h="11px" />
                </div>
              </div>
            ))}
          </div>
        ) : !history || history.payments.length === 0 ? (
          <EmptyState
            title="No Payments Recorded"
            description="Payments made against this invoice will show up here."
            fullScreen={false}
          />
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