import { ArrowLeft, Loader2 } from 'lucide-react';
import { fmtKes } from '@/lib/utils/site-helpers';
import type { SiteWorkerRow } from '@/types/site-worker-detail';

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function isActive(status: string) {
  return status?.toUpperCase() === 'ACTIVE';
}

function StatusPill({ status }: { status: string }) {
  const active = isActive(status);
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
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

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <span className="text-sm flex-shrink-0" style={{ color: 'var(--gv-text-subtle)' }}>{label}</span>
      <span className="text-sm font-medium text-white text-right min-w-0 break-words">{value}</span>
    </div>
  );
}

export function WorkerDetailView({ row, onBack }: { row: SiteWorkerRow; onBack: () => void }) {
  const d = row.detail;
  const attendances = d?.attendances ?? [];
  const tasks = d?.tasks ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'var(--gv-bg-gradient)' }}>
      <div
        className="flex-shrink-0"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="mx-auto w-full max-w-3xl flex items-center gap-3 px-4 sm:px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--gv-brand)' }}>
            <ArrowLeft className="w-5 h-5" />Back
          </button>
          <p className="flex-1 text-center text-lg font-bold text-white pr-16">Worker Details</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 flex flex-col gap-5">
          {/* Header */}
          <div className="gv-card flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'rgba(51,144,124,0.18)', color: 'var(--gv-brand)' }}>
              {initial(row.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-white break-words">{row.fullName}</p>
              <div className="mt-1.5"><StatusPill status={d?.status ?? row.status} /></div>
            </div>
          </div>

          {!d && !row.detailFailed && (
            <div className="gv-card flex items-center justify-center gap-3 py-10">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
              <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>Loading worker…</span>
            </div>
          )}
          {row.detailFailed && !d && (
            <div className="gv-card py-8 text-center text-sm" style={{ color: 'var(--gv-text-muted)' }}>
              Couldn&apos;t load this worker&apos;s details. Close and try again.
            </div>
          )}

          {d && (
            <>
              <div className="gv-card">
                <p className="text-base font-semibold text-white mb-1">Details</p>
                <DetailLine label="National ID" value={d.nationalId || '—'} />
                <DetailLine label="Phone" value={d.phone || '—'} />
                <DetailLine label="Skill" value={d.skillName || '—'} />
                <div className="flex items-start justify-between gap-4 pt-2.5">
                  <span className="text-sm flex-shrink-0" style={{ color: 'var(--gv-text-subtle)' }}>Daily Rate</span>
                  <span className="text-sm font-medium text-white text-right min-w-0 break-words">
                    {d.dailyRate != null ? fmtKes(d.dailyRate) : '—'}
                  </span>
                </div>
              </div>

              <div className="gv-card">
                <p className="text-base font-semibold text-white mb-2">Attendance ({attendances.length})</p>
                {attendances.length === 0 ? (
                  <p className="text-sm py-3" style={{ color: 'var(--gv-text-subtle)' }}>No check-ins yet.</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {attendances.map((a) => (
                      <div key={a.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
                        style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                        <span className="text-sm text-white min-w-0 break-words">{a.date || '—'}</span>
                        <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                          {a.checkInTime ? a.checkInTime.split(',')[0] : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="gv-card">
                <p className="text-base font-semibold text-white mb-2">Assigned Tasks ({tasks.length})</p>
                {tasks.length === 0 ? (
                  <p className="text-sm py-3" style={{ color: 'var(--gv-text-subtle)' }}>No tasks assigned.</p>
                ) : (
                  tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-4 py-2.5"
                      style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white break-words">{t.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gv-text-subtle)' }}>{t.status}</p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
                        {t.percentage}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
