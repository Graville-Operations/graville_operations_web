import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import { AttendanceRecord } from '@/types/site';


type WorkerRecord = AttendanceRecord & { checkInCount?: number | null };

const COLUMNS = ["Worker's Name", 'Phone Number', 'National ID', 'No. of Check-ins'];

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

export function AllWorkersScreen({
  records,
  dateLabel,
  onClose,
}: {
  records: AttendanceRecord[];
  dateLabel: string;
  onClose: () => void;
}) {
  const rows = records as WorkerRecord[];

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
        <div className="mx-auto w-full max-w-6xl flex items-center gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--gv-brand)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-white">Workers on Site</p>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{dateLabel}</p>
          </div>
          <span className="w-16" />
        </div>
      </div>

      {/* Content, centered and inset from the screen edges */}
      <div className="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-6xl px-6 py-6 md:px-10 md:py-8">
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
            {rows.length} worker{rows.length !== 1 ? 's' : ''} checked in
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="gv-card flex flex-col items-center gap-3 py-20 text-center">
            <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
            <p className="text-base text-white">No check-ins for this period</p>
          </div>
        ) : (
          <div className="gv-card flex-1 min-h-0 overflow-hidden" style={{ padding: 0 }}>
            {/* This wrapper scrolls both ways so the sticky header stays at the top */}
            <div className="h-full overflow-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: '640px' }}>
                <thead>
                  <tr>
                    {COLUMNS.map((col, i) => (
                      <th
                        key={col}
                        className={`sticky top-0 z-10 px-5 py-3 text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${
                          i === COLUMNS.length - 1 ? 'text-center' : ''
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
                    const name = r.workerName?.trim() ? r.workerName : '—';
                    const initials = name !== '—' ? getInitials(name) : '?';
                    const isLast = idx === rows.length - 1;
                    const cellStyle = {
                      color: 'rgba(255,255,255,0.8)',
                      borderRight: '1px solid var(--gv-glass-border)',
                    };

                    return (
                      <tr
                        key={r.id}
                        style={{ borderBottom: isLast ? 'none' : '1px solid var(--gv-glass-border)' }}
                      >
                        <td className="px-5 py-3" style={cellStyle}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                              style={{
                                background: 'rgba(51,144,124,0.2)',
                                border: '1px solid rgba(51,144,124,0.4)',
                              }}
                            >
                              {initials}
                            </div>
                            <span className="text-base font-semibold text-white capitalize">{name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-base whitespace-nowrap" style={cellStyle}>
                          {r.phone ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-base whitespace-nowrap" style={cellStyle}>
                          {r.nationalId ?? '—'}
                        </td>
                        <td
                          className="px-5 py-3 text-base text-center whitespace-nowrap"
                          style={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          {r.checkInCount ?? '—'}
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