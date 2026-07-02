import Link from 'next/link';
import { Users, ArrowRight, Loader2, UserCircle, BarChart2, Briefcase } from 'lucide-react';
import { ApiUser } from '@/store/user-store';
import { ROUTES } from '@/lib/routes';
import { formatRole } from '@/lib/utils/format-role';

interface RecentUsersCardProps {
  users: ApiUser[];
  loading: boolean;
}

export function RecentUsersCard({ users, loading }: RecentUsersCardProps) {
  return (
    <div className="gv-card overflow-hidden flex flex-col" style={{ padding: 0 }}>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="gv-icon-box" style={{ width: '2rem', height: '2rem' }}>
            <Users size={15} style={{ color: '#33907c' }} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--gv-text-primary)' }}>
            Recent Users
          </h3>
        </div>
        <Link
          href={ROUTES.users.dashboard}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: '#33907c' }}
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex-1 px-5 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin" style={{ color: '#33907c' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <UserCircle size={32} style={{ color: 'var(--gv-text-faint)' }} className="mb-2" />
            <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>No users yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((u, idx) => (
              <div
                key={u.ref_id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg"
                style={{ borderBottom: idx < users.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(51,144,124,0.20)' }}
                >
                  <span className="text-white text-xs font-bold">
                    {u.firstName?.[0] ?? '?'}{u.lastName?.[0] ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--gv-text-primary)' }}>
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--gv-text-subtle)' }}>{u.email}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(51,144,124,0.15)', color: '#33907c', border: '1px solid rgba(51,144,124,0.25)' }}
                >
                  {formatRole(u.role) || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
        {[
          { label: 'Add User', href: ROUTES.users.new, icon: Users },
          { label: 'Roles', href: ROUTES.users.roles, icon: BarChart2 },
          { label: 'Reports', href: ROUTES.users.reports, icon: Briefcase },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium"
            style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)', border: '1px solid var(--gv-glass-border)' }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}