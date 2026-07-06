
import { AttendanceDay, Bar, AttendanceTab } from '@/types/dashboard';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fmtKsh(n: number): string {
  if (n >= 1_000_000) return `KSH ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KSH ${Math.round(n / 1_000)}k`;
  return `KSH ${n.toLocaleString()}`;
}

export function normaliseAnalyticsResponse(raw: unknown): AttendanceDay[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  let arr: unknown[] = [];
  if (Array.isArray(obj.data)) arr = obj.data;
  else if (Array.isArray(raw)) arr = raw as unknown[];
  return arr
    .map((row: any) => ({
      date: String(row.date ?? row.attendance_date ?? row.day ?? ''),
      present_count: Number(
        row.attendance_count ?? row.present_count ?? row.present ??
        row.count ?? row.workers_present ?? row.total_present ?? row.total ?? 0,
      ),
    }))
    .filter((r) => r.date !== '');
}

export function buildDateRange(
  tab: AttendanceTab,
  dateFrom: string,
  dateTo: string,
): { from: string; to: string } | null {
  const now = new Date();
  if (tab === 'Today') { const iso = toISO(now); return { from: iso, to: iso }; }
  if (tab === 'Week') {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toISO(monday), to: toISO(sunday) };
  }
  if (tab === 'Month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toISO(first), to: toISO(last) };
  }
  if (tab === 'Custom') {
    if (!dateFrom || !dateTo) return null;
    const today  = toISO(new Date());
    const safeTo = dateTo > today ? today : dateTo;
    return { from: dateFrom, to: safeTo };
  }
  return null;
}

export function buildBars(
  summary: AttendanceDay[],
  fromISO: string,
  toISO_: string,
  tab: AttendanceTab,
): Bar[] {
  const lookup: Record<string, number> = {};
  for (const row of summary) lookup[row.date] = row.present_count;
  const result: Bar[] = [];

  function parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const cur = parseLocalDate(fromISO);
  const end = parseLocalDate(toISO_);
  const rangeDays = (end.getTime() - cur.getTime()) / 86400000;

  while (cur <= end) {
    const iso = toISO(cur);
    const dow = cur.getDay();
    const label =
      tab === 'Today' ? 'Today' :
      tab === 'Week'  ? DAY_NAMES[dow] :
      tab === 'Custom' && rangeDays > 7
        ? `${cur.getDate()}/${cur.getMonth() + 1}`
        : tab === 'Custom' ? DAY_NAMES[dow]
        : String(cur.getDate());
    result.push({
      label,
      fullLabel: tab === 'Today' ? 'Today' : DAY_FULL[dow],
      date: iso,
      dateDisplay: cur.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      present: lookup[iso] ?? 0,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}