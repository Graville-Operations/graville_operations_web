import Link from 'next/link';

interface InvoiceSummaryStatCardProps {
  name: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  pendingAmount: number;
  totalPendingInvoices: number;
  paidAmount: number;
  totalPaidInvoices: number;
  href?: string;
  loading?: boolean;
}

export function InvoiceSummaryStatCard({
  name, icon: Icon, iconBg, iconColor,
  pendingAmount, totalPendingInvoices,
  paidAmount, totalPaidInvoices,
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
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Pending</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(251,146,60,0.12)',
                  color: '#fb923c',
                  border: '1px solid rgba(251,146,60,0.20)',
                }}
              >
                {totalPendingInvoices} total
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              KES {pendingAmount.toLocaleString()}
            </p>
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>Paid</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(51,144,124,0.15)',
                  color: '#33907c',
                  border: '1px solid rgba(51,144,124,0.25)',
                }}
              >
                {totalPaidInvoices} total
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--gv-text-primary)' }}>
              KES {paidAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return <div className="h-full">{content}</div>;
}