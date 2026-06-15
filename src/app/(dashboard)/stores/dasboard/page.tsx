'use client';
import { useMemo } from 'react';
import {
  Package, Wrench, ShoppingCart, AlertTriangle,
  ArrowLeftRight, Plus, BarChart3,
} from 'lucide-react';

const DUMMY = {
  total_orders:       47,
  sites_low_stock:    [
    { id: 1, name: 'Mishi Mboko',   low_count: 4 },
    { id: 2, name: 'Kware Primary',       low_count: 2 },
    { id: 3, name: 'Huruma',    low_count: 1 },
  ],
  total_materials:    312,
  total_tools:        88,
  total_transfers:    9,   
  damaged_tools:      5,
  total_hire_cost:    485_000,
};

function fmtKES(n: number) {
  return `KSH ${n.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Variant = 'default' | 'warn' | 'danger' | 'success' | 'info';

const BORDER_CLS: Record<Variant, string> = {
  default: 'border-[color:var(--border)]',
  warn:    'border-[color:var(--gv-border-warn)]',
  danger:  'border-[color:var(--gv-border-danger)]',
  success: 'border-[color:var(--gv-border-success)]',
  info:    'border-[color:var(--gv-border-info)]',
};
const ICON_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--primary)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};
const VAL_CLS: Record<Variant, string> = {
  default: 'text-[color:var(--foreground)]',
  warn:    'text-[color:var(--gv-text-warn)]',
  danger:  'text-[color:var(--destructive)]',
  success: 'text-[color:var(--gv-text-success)]',
  info:    'text-[color:var(--gv-text-info)]',
};
const TAG_CLS: Record<Exclude<Variant, 'default'>, string> = {
  warn:    'border-[color:var(--gv-border-warn)] text-[color:var(--gv-text-warn)]',
  danger:  'border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]',
  success: 'border-[color:var(--gv-border-success)] text-[color:var(--gv-text-success)]',
  info:    'border-[color:var(--gv-border-info)] text-[color:var(--gv-text-info)]',
};
const TAG_LABEL: Record<Exclude<Variant, 'default'>, string> = {
  warn: 'Warning', danger: 'Critical', success: 'Good', info: 'Info',
};

interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon:     React.ReactNode;
  variant?: Variant;
  badge?:   string;         
}

function StatCard({ label, value, sub, icon, variant = 'default', badge }: StatCardProps) {
  return (
    <div className={`gv-card flex flex-col gap-4 ${BORDER_CLS[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className={ICON_CLS[variant]}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="gv-tag text-[color:var(--gv-text-subtle)]">{badge}</span>
          )}
          {variant !== 'default' && (
            <span className={`gv-tag ${TAG_CLS[variant as Exclude<Variant, 'default'>]}`}>
              {TAG_LABEL[variant as Exclude<Variant, 'default'>]}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className={`text-3xl font-bold tracking-tight ${VAL_CLS[variant]}`}>{value}</p>
        {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function LowStockCard({ sites }: { sites: typeof DUMMY.sites_low_stock }) {
  return (
    <div className={`gv-card flex flex-row gap-4 ${BORDER_CLS.default}`}>
      <div className="flex flex-col gap-4 shrink-0">
        <div className="gv-icon-box">
          <span className={ICON_CLS.default}><AlertTriangle size={18} /></span>
        </div>
        <div>
          <p className="gv-label whitespace-nowrap">Sites with Low Stock</p>
          <p className={`text-3xl font-bold tracking-tight ${VAL_CLS.default}`}>
            {sites.length}
          </p>
        </div>
      </div>
      {sites.length > 0 && (
        <ul className="flex flex-col justify-center gap-1.5 pl-4 border-l border-[color:var(--border)] min-w-0">
          {sites.map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-xs">
              <span className="text-[color:var(--foreground)] truncate flex-1">{s.name}</span>
              <span className="gv-tag shrink-0 text-[color:var(--muted-foreground)]">
                {s.low_count} item{s.low_count !== 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ActionBtnProps {
  label:   string;
  icon:    React.ReactNode;
  onClick: () => void;
}
function ActionBtn({ label, icon, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                 bg-[color:var(--primary)] text-[color:var(--primary-foreground)]
                 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
    >
      {icon}
      {label}
    </button>
  );
}

export default function StoreDashboardPage() {
  const d = DUMMY;

  const cards = useMemo(() => [
    {
      key:     'orders',
      label:   'Total Orders',
      value:   d.total_orders,
      sub:     'Across all sites',
      icon:    <ShoppingCart size={18} />,
      variant: 'default' as Variant,
    },
    {
      key:     'materials',
      label:   'Total Materials',
      value:   d.total_materials,
      sub:     'Company-wide stock items',
      icon:    <Package size={18} />,
      variant: 'default' as Variant,
    },
    {
      key:     'tools',
      label:   'Total Tools',
      value:   d.total_tools,
      sub:     'All sites combined',
      icon:    <Wrench size={18} />,
      variant: 'default' as Variant,
    },
    {
      key:     'transfers',
      label:   'Total Transfers',
      value:   d.total_transfers,
      sub:     'Material transfers today',
      icon:    <ArrowLeftRight size={18} />,
      variant: 'default' as Variant,
      badge:   'Today',
    },
    {
      key:     'damaged',
      label:   'Damaged Tools',
      value:   d.damaged_tools,
      sub:     'Tools marked as damaged',
      icon:    <Wrench size={18} />,
      variant: 'default' as Variant,
    },
    {
      key:     'hire_cost',
      label:   'Total Hire Cost',
      value:   fmtKES(d.total_hire_cost),
      sub:     'Active tool hire across all sites',
      icon:    <BarChart3 size={18} />,
      variant: 'default' as Variant,
    },
  ], [d]);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <ActionBtn
            label="Add Material"
            icon={<Plus size={15} />}
            onClick={() => {}}
          />
          <ActionBtn
            label="Add Tool"
            icon={<Plus size={15} />}
            onClick={() => {}}
          />
        </div>
      </div>

      <p className="text-lg text-[color:var(--muted-foreground)]">
        Company's wide overview: all figures aggregate across every active site.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.slice(0, 1).map((c) => (
          <StatCard key={c.key} {...c} />
        ))}

        <LowStockCard sites={d.sites_low_stock} />

        {cards.slice(1).map((c) => (
          <StatCard key={c.key} {...c} />
        ))}

      </div>

    </div>
  );
}