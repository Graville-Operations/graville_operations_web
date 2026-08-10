'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useClientPaymentHistory } from '@/hooks/client-invoices/useClientPaymentHistory';

function ShimmerRow() {
  return (
    <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

export default function ClientInvoicePaymentHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { history, loading, error } = useClientPaymentHistory(id);

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-text-muted)' }}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          Payment History
        </h2>
      </div>

      {error ? (
        <EmptyState
          title="Couldn't load payment history"
          description="Something went wrong fetching this invoice's payments."
          fullScreen={false}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="gv-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>
                Total Invoice Value
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: 'var(--gv-text-primary)' }}>
                {loading ? '—' : `KES ${history?.total_invoice_value.toLocaleString()}`}
              </p>
            </div>
            <div className="gv-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>
                Total Paid
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: 'var(--gv-text-primary)' }}>
                {loading ? '—' : `KES ${history?.total_paid.toLocaleString()}`}
              </p>
            </div>
            <div className="gv-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#33907c' }}>
                Remaining Balance
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: 'var(--gv-text-primary)' }}>
                {loading ? '—' : `KES ${history?.remaining_balance.toLocaleString()}`}
              </p>
            </div>
          </div>

          <div className="gv-card p-0! overflow-hidden">
            <div
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)', color: '#33907c' }}
            >
              Payments
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <ShimmerRow key={i} />)
            ) : !history || history.payments.length === 0 ? (
              <EmptyState
                title="No payments recorded"
                description="Payments recorded against this invoice will show up here."
                fullScreen={false}
              />
            ) : (
              history.payments.map((payment, idx) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4"
                  style={{
                    borderBottom: idx < history.payments.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                      KES {payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
                      {payment.notes || 'No notes'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                      {payment.payment_date}
                    </p>
                    {payment.recorded_by && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
                        Recorded by {payment.recorded_by}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}