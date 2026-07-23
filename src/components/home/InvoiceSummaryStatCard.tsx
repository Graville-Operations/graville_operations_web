// src/components/home/InvoiceSummaryStatCard.tsx
import Link from 'next/link';

interface InvoiceSummaryStatCardProps {
  name: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  totalAmountPaid: number;
  totalRemainingBalance: number;
  totalInvoiceCount: number;
  href?: string;
  loading?: boolean;
}

export function InvoiceSummaryStatCard({
  name, icon: Icon, iconBg, iconColor,
  totalAmountPaid, totalRemainingBalance, totalInvoiceCount,
  href, loading,
}: InvoiceSummaryStatCardProps) {
  const content = (
    <div className="gv-card gv-stat-card h-full p-5 flex flex-col gap-3 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--gv-text-muted)' }}>
          {name}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-24 rounded-md animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
          <div className="h-6 w-24 rounded-md animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div>
            <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Total Paid</span>
            <p className="text-lg font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              KES {totalAmountPaid.toLocaleString()}
            </p>
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Remaining Balance</span>
            <p className="text-lg font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              KES {totalRemainingBalance.toLocaleString()}
            </p>
          </div>

          <div
            className="flex items-center justify-between pt-2.5 mt-0.5"
            style={{ borderTop: '1px solid var(--gv-glass-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Total Invoices</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(148,163,184,0.15)',
                color: 'var(--gv-text-primary)',
                border: '1px solid var(--gv-glass-border)',
              }}
            >
              {totalInvoiceCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return <div className="h-full">{content}</div>;
}