const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  PARTIALLY_PAID: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  PAID: 'bg-[#33907C]/15 text-[#33907C] border-[#33907C]/35',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? 'bg-white/10 text-white/60 border-white/20';
  const label = status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>
      {label}
    </span>
  );
}