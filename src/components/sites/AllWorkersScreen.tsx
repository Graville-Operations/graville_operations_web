import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import { AttendanceRecord } from '@/types/site';
import { AttendanceRow } from '@/components/sites/AttendanceRow';

export function AllWorkersScreen({
  records,
  dateLabel,
  onClose,
}: {
  records: AttendanceRecord[];
  dateLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'var(--gv-bg-gradient)' }}>
      <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{
          background: 'var(--gv-nav-bg)',
          borderBottom: '1px solid var(--gv-glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
        <button onClick={onClose} className="flex items-center gap-2 text-base font-semibold"
          style={{ color: 'var(--gv-brand)' }}>
          <ArrowLeft className="w-5 h-5" />Back
        </button>
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-white">Workers on Site</p>
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{dateLabel}</p>
        </div>
        <span className="w-16" />
      </div>

      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-semibold"
          style={{ background: 'rgba(51,144,124,0.15)', border: '1px solid rgba(51,144,124,0.35)', color: '#33907C' }}>
          <Users className="w-4 h-4" />
          {records.length} worker{records.length !== 1 ? 's' : ''} checked in
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
            <p className="text-base text-white">No check-ins for this period</p>
          </div>
        ) : (
          <div className="gv-card" style={{ padding: '0 1rem' }}>
            {records.map((r) => <AttendanceRow key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}