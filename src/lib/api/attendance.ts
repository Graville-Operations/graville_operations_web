
import api from '@/lib/api';
import { AttendanceSummary } from '@/types/site-detail';
import { AttendanceDay } from '@/types/dashboard';
import { unwrapAttendanceSummary } from '@/lib/utils/site-helpers';
import { normaliseAnalyticsResponse } from '@/lib/utils/dashboard-helpers';

export async function fetchAttendanceSummary(params: {
  siteId: number | string;
  startDate: string;
  endDate: string;
}): Promise<AttendanceSummary | null> {
  const { siteId, startDate, endDate } = params;
  const res = await api.get('/attendance/summary', {
    params: { site_id: siteId, start_date: startDate, end_date: endDate },
  });
  return unwrapAttendanceSummary(res.data);
}

export async function fetchAttendanceAnalytics(
  startDate: string,
  endDate: string,
): Promise<AttendanceDay[]> {
  try {
    const res = await api.get('/attendance/analytics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return normaliseAnalyticsResponse(res.data);
  } catch (err) {
    console.warn('[Attendance] fetch error:', err);
    return [];
  }
}