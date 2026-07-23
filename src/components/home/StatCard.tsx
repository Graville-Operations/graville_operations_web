import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  change?: string;
  positive?: boolean;
  href?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, iconBg, iconColor, change, positive, href, loading }: StatCardProps) {
  const content = (
    <div className="gv-card gv-stat-card h-full p-5 flex flex-col gap-4 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {change && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: positive ? 'rgba(51,144,124,0.15)' : 'rgba(248,113,113,0.12)',
              color: positive ? '#33907c' : '#f87171',
              border: `1px solid ${positive ? 'rgba(51,144,124,0.25)' : 'rgba(248,113,113,0.20)'}`,
            }}
          >
            {change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 rounded-md animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
      ) : (
        <p className="text-2xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          {value}
        </p>
      )}
      <p className="text-sm mt-auto" style={{ color: 'var(--gv-text-muted)' }}>{label}</p>
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return <div className="h-full">{content}</div>;
}