import { X, Mail, Phone, Building2, BadgeCheck } from 'lucide-react';
import { UserDetail } from '@/types/users';
import { RoleBadge } from './RoleBadge';
import { InfoRow } from './InfoRow';

interface UserDetailModalProps {
  user: UserDetail | null;
  visible: boolean;
  loading: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, visible, loading, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-all duration-250 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          background:           'var(--gv-nav-bg)',
          border:               '1px solid var(--gv-glass-border)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{ background: 'var(--gv-brand)' }}
            >
              {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <RoleBadge role={user.role} className="mt-0.5" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="gv-card space-y-4">
                <p className="gv-label">Contact</p>
                <InfoRow icon={<Mail size={14} />}  label="Email" value={user.email} />
                <InfoRow icon={<Phone size={14} />} label="Phone" value={user.phone ?? '—'} />
              </div>

              <div className="gv-card space-y-4">
                <p className="gv-label">Account</p>
                <InfoRow icon={<BadgeCheck size={14} />} label="Role" value={user.role ?? '—'} />
                <InfoRow
                  icon={
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        user.is_active !== false ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                  }
                  label="Status"
                  value={user.is_active !== false ? 'Active' : 'Inactive'}
                />
              </div>

              <div className="gv-card space-y-3">
                <p className="gv-label flex items-center gap-1.5">
                  <Building2 size={12} />
                  Departments
                </p>
                {user.departments && user.departments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.departments.map((d) => (
                      <span
                        key={d.id}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(51,144,124,0.12)',
                          border:     '1px solid rgba(51,144,124,0.28)',
                          color:      'var(--gv-brand)',
                        }}
                      >
                        {d.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
                    Not assigned to any department
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end px-7 py-4"
          style={{ borderTop: '1px solid var(--gv-glass-border)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}