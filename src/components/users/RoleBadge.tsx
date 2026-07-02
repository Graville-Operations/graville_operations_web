import { ROLE_COLORS, DEFAULT_ROLE_BADGE } from '@/lib/users-constants';

export function RoleBadge({ role, className = '' }: { role?: string | null; className?: string }) {
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[role ?? ''] ?? DEFAULT_ROLE_BADGE} ${className}`}>
      {role ?? '—'}
    </span>
  );
}