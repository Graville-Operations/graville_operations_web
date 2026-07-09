import { ChevronRight } from 'lucide-react';

export type Variant = 'default' | 'warn' | 'danger' | 'success' | 'info';

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
  onClick?: () => void;
}

export function StatCard({ label, value, sub, icon, variant = 'default', onClick }: StatCardProps) {
  return (
    <div
      className={`gv-card flex flex-col gap-4 ${BORDER_CLS[variant]} ${
        onClick
          ? 'cursor-pointer hover:bg-(--gv-glass-bg-strong) hover:border-(--gv-glass-border-hover) hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-all duration-200'
          : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className={ICON_CLS[variant]}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {variant !== 'default' && (
            <span className={`gv-tag ${TAG_CLS[variant as Exclude<Variant, 'default'>]}`}>
              {TAG_LABEL[variant as Exclude<Variant, 'default'>]}
            </span>
          )}
          {onClick && <ChevronRight size={14} className="text-(--gv-text-faint)" />}
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