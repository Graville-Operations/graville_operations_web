'use client';
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: 'Pending',     bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  in_progress: { label: 'In Progress', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  completed:   { label: 'Completed',   bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
  cancelled:   { label: 'Cancelled',   bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

const FALLBACK_META = { bg: 'rgba(255,255,255,0.10)', color: 'rgba(147,197,253,0.60)' };
export const EXTERNAL_WORK_ERROR_STYLE = {
  background: 'rgba(248,113,113,0.10)',
  border: '1px solid rgba(248,113,113,0.25)',
  color: '#f87171',
} as const;

export default function ExternalWorkStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status];
  const label = meta?.label ?? status.replace(/_/g, ' ');
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: meta?.bg ?? FALLBACK_META.bg, color: meta?.color ?? FALLBACK_META.color }}
    >
      {label}
    </span>
  );
}