import { formatRole } from '@/lib/utils/format-role';

interface WelcomeBannerProps {
  firstName?: string;
  role?: string | null;
}

export function WelcomeBanner({ firstName, role }: WelcomeBannerProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(51,144,124,0.30) 0%, rgba(23,57,144,0.25) 100%)',
        border: '1px solid rgba(51,144,124,0.35)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(51,144,124,0.18) 0%, transparent 70%)' }}
      />
      <div className="relative">
        <p className="gv-eyebrow mb-2">Dashboard</p>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
          {greeting}, {firstName ?? 'there'} 👋
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
          <span
            className="font-semibold mr-2 px-2 py-0.5 rounded-full text-xs"
            style={{
              background: 'rgba(51,144,124,0.20)',
              color: '#33907c',
              border: '1px solid rgba(51,144,124,0.30)',
            }}
          >
            {formatRole(role ?? undefined)}
          </span>
          Here&apos;s what&apos;s happening today.
        </p>
      </div>
    </div>
  );
}