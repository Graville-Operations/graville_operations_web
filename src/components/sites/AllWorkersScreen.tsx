import { useState } from 'react';
import { ArrowLeft, Users, Loader2, ChevronRight } from 'lucide-react';
import { useSiteWorkerRoster } from '@/hooks/sites/useSiteWorkerRoster';
import { WorkerDetailView } from '@/components/sites/WorkerDetailView';
import type { SiteWorkerRow } from '@/types/site-worker-detail';

const COLUMNS = ['Name', 'Phone No', 'National ID', 'Status', 'Attendance'];

function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StatusPill({ status }: { status: string }) {
  const active = status?.toUpperCase() === 'ACTIVE';
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
      style={{
        color: active ? '#33907C' : 'var(--gv-text-subtle)',
        background: active ? 'rgba(51,144,124,0.15)' : 'var(--gv-glass-bg)',
        border: `1px solid ${active ? 'rgba(51,144,124,0.35)' : 'var(--gv-glass-border)'}`,
      }}
    >
      {status || '—'}
    </span>
  );
}

/** Placeholder while a row's details are still loading. */
function CellSkeleton() {
  return <span className="inline-block h-4 w-20 rounded animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />;
}

export function AllWorkersScreen({ siteId, onClose }: { siteId: number; onClose: () => void }) {
  const { rows, loading, error } = useSiteWorkerRoster(siteId);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected: SiteWorkerRow | undefined = rows.find((r) => r.id === selectedId);

  if (selected) {
    return <WorkerDetailView row={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'var(--gv-bg-gradient)' }}>
      {/* Top bar */}
      <div
        className="flex-shrink-0"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="mx-auto w-full max-w-6xl flex items-center gap-3 px-4 sm:px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--gv-brand)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <p className="flex-1 text-center text-lg font-bold text-white pr-16">All Workers</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-10 md:py-8">
        <div className="pb-4 flex-shrink-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-semibold"
            style={{
              background: 'rgba(51,144,124,0.15)',
              border: '1px solid rgba(51,144,124,0.35)',
              color: '#33907C',
            }}
          >
            <Users className="w-4 h-4" />
            {rows.length} worker{rows.length !== 1 ? 's' : ''} on this site
          </div>
        </div>

        {loading ? (
          <div className="gv-card flex items-center justify-center gap-3 py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
            <span className="text-base" style={{ color: 'var(--gv-text-muted)' }}>Loading workers…</span>
          </div>
        ) : error ? (
          <div className="gv-card py-16 text-center text-base" style={{ color: 'var(--gv-text-muted)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div className="gv-card flex flex-col items-center gap-3 py-20 text-center">
            <Users className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
            <p className="text-base text-white">No workers on this site yet</p>
          </div>
        ) : (
          <div className="gv-card flex-1 min-h-0 overflow-hidden" style={{ padding: 0 }}>
            {/* Scrolls both ways so the sticky header stays at the top */}
            <div className="h-full overflow-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: '720px' }}>
                <thead>
                  <tr>
                    {COLUMNS.map((col, i) => (
                      <th
                        key={col}
                        className={`sticky top-0 z-10 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${
                          col === 'Attendance' ? 'text-center' : ''
                        }`}
                        style={{
                          background: 'rgba(22,38,70,0.97)',
                          color: 'rgba(255,255,255,0.9)',
                          borderBottom: '1px solid var(--gv-glass-border-hover)',
                          borderRight: i < COLUMNS.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const d = r.detail;
                    const isLast = idx === rows.length - 1;
                    const pending = !d && !r.detailFailed;
                    const cellStyle = {
                      color: 'rgba(255,255,255,0.8)',
                      borderRight: '1px solid var(--gv-glass-border)',
                    };
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(r.id); }
                        }}
                        tabIndex={0}
                        role="button"
                        className="cursor-pointer transition-colors hover:bg-white/5 focus:bg-white/5 outline-none"
                        style={{ borderBottom: isLast ? 'none' : '1px solid var(--gv-glass-border)' }}
                      >
                        <td className="px-4 sm:px-5 py-3" style={cellStyle}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                              style={{ background: 'rgba(51,144,124,0.2)', border: '1px solid rgba(51,144,124,0.4)' }}
                            >
                              {getInitials(r.fullName) || '?'}
                            </div>
                            <span className="text-base font-semibold text-white capitalize">{r.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-base whitespace-nowrap" style={cellStyle}>
                          {pending ? <CellSkeleton /> : d?.phone || '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-base whitespace-nowrap" style={cellStyle}>
                          {pending ? <CellSkeleton /> : d?.nationalId || '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3" style={cellStyle}>
                          <StatusPill status={d?.status || r.status} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-base text-center whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <span className="inline-flex items-center gap-2">
                            {pending ? <CellSkeleton /> : d ? d.attendances.length : '—'}
                            <ChevronRight className="w-4 h-4" style={{ color: 'var(--gv-text-subtle)' }} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
