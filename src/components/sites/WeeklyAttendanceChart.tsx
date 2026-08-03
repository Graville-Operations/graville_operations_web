import { format } from 'date-fns';
import { AttendanceBreakdownItem } from '@/types/site';

export function WeeklyAttendanceChart({ breakdown, totalWorkers }: {
  breakdown: AttendanceBreakdownItem[]; totalWorkers: number;
}) {
  const counts   = breakdown.map((d) => d.attendanceCount);
  const maxCount = Math.max(...counts, 1);
  const scaleMax = Math.max(totalWorkers > 0 ? totalWorkers : 0, maxCount, 10);

  const CHART_HEIGHT = 200;
  const LABEL_SPACE  = 26;
  const BAR_TRACK    = CHART_HEIGHT - LABEL_SPACE;
  const BAR_MIN      = 6;
  const BAR_ZERO     = 3;

  function barHeightPx(count: number) {
    if (count <= 0) return BAR_ZERO;
    const ratio = Math.min(count / scaleMax, 1);
    return Math.max(BAR_MIN, Math.round(ratio * BAR_TRACK));
  }

  const DAY_ABBR: Record<string, string> = {
    Sunday: 'S', Monday: 'M', Tuesday: 'T',
    Wednesday: 'W', Thursday: 'T', Friday: 'F', Saturday: 'S',
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-1" style={{ height: CHART_HEIGHT }}>
        {breakdown.map((item) => {
          const barPx   = barHeightPx(item.attendanceCount);
          const isToday = item.date === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={item.date} className="flex flex-col items-center justify-end gap-1 flex-1"
              style={{ height: CHART_HEIGHT }}>
              <span className="text-xs font-semibold"
                style={{
                  color: 'var(--gv-text-subtle)',
                  visibility: item.attendanceCount > 0 ? 'visible' : 'hidden',
                }}>
                {item.attendanceCount}
              </span>
              <div className="relative w-full rounded-t-md overflow-hidden"
                style={{ maxWidth: 32, height: BAR_TRACK, background: 'rgba(255,255,255,0.06)' }}>
                <div className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-500"
                  style={{ height: barPx, background: isToday ? '#3b82f6' : 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1">
        {breakdown.map((item) => (
          <div key={item.date} className="flex-1 flex justify-center">
            <span className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
              {DAY_ABBR[item.day] ?? item.day[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}