// src/app/(dashboard)/home/invoices/[type]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchInvoiceSummary } from '@/lib/api/invoices';
import { InvoiceSummaryItem } from '@/types/invoice-summary';
import { INVOICE_SUMMARY_CONFIG } from '@/lib/invoice-summary-config';
import { ROUTES } from '@/lib/routes';

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="gv-card p-5">
      <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{label}</span>
      <p className="text-2xl font-bold mt-1" style={{ color: 'var(--gv-text-primary)' }}>
        KES {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBlock({
  label, count, amount, color,
}: { label: string; count: number; amount: number; color: string }) {
  return (
    <div className="gv-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
          {label}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${color}1F`, color, border: `1px solid ${color}40` }}
        >
          {count} invoice{count === 1 ? '' : 's'}
        </span>
      </div>
      <p className="text-lg font-bold" style={{ color: 'var(--gv-text-primary)' }}>
        KES {amount.toLocaleString()}
      </p>
    </div>
  );
}

export default function InvoiceCategoryDetailPage() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const type = params.type;

  const [summary, setSummary] = useState<InvoiceSummaryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchInvoiceSummary()
      .then((items) => {
        const match = items.find((item) => item.id === type);
        if (!match) {
          setNotFound(true);
          return;
        }
        setSummary(match);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [type]);

  const config = INVOICE_SUMMARY_CONFIG[type];
  const Icon = config?.icon;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(ROUTES.home)}
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl" style={{ background: config.iconBg }}>
            <Icon size={22} style={{ color: config.iconColor }} />
          </div>
        )}
        <h1 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          {config?.label ?? summary?.name ?? 'Invoice Summary'}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ background: 'var(--gv-glass-bg-strong)' }}
            />
          ))}
        </div>
      ) : notFound || !summary ? (
        <p style={{ color: 'var(--gv-text-muted)' }}>
          No summary data found for this invoice category.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatBlock label="Total Amount Paid" value={summary.totalAmountPaid} />
            <StatBlock label="Total Remaining Balance" value={summary.totalRemainingBalance} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatusBlock
              label="Paid"
              count={summary.paidCount}
              amount={summary.paidAmount}
              color="#33907c"
            />
            <StatusBlock
              label="Pending"
              count={summary.pendingCount}
              amount={summary.pendingAmount}
              color="#60a5fa"
            />
            <StatusBlock
              label="Rejected"
              count={summary.rejectedCount}
              amount={summary.rejectedAmount}
              color="#f87171"
            />
            <div className="gv-card p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                  Partially Paid
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#fb923c1F', color: '#fb923c', border: '1px solid #fb923c40' }}
                >
                  {summary.partiallyPaidCount} invoice{summary.partiallyPaidCount === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
                <div>
                  <p>Invoice Total</p>
                  <p className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {summary.partiallyPaidInvoiceTotal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p>Paid</p>
                  <p className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {summary.partiallyPaidAmountPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p>Balance Due</p>
                  <p className="font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
                    KES {summary.partiallyPaidBalanceDue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}