import { AttendanceRecord } from '@/types/site';

/** One row per worker; `checkIns` = how many times they checked in over the selected range. */
export function AttendanceRow({ record, checkIns }: { record: AttendanceRecord; checkIns: number }) {
  const name     = record.workerName ?? '—';
  const initials = name !== '—'
    ? name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return (
    <div className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
        style={{ background: 'rgba(51,144,124,0.2)', border: '1px solid rgba(51,144,124,0.4)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-white capitalize">{name}</p>
        <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>{record.phone ?? '—'}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          Check-ins: <span className="text-base font-bold text-white">{checkIns}</span>
        </p>
        {record.nationalId && (
          <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>ID: {record.nationalId}</p>
        )}
      </div>
    </div>
  );
}