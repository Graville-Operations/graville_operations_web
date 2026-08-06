import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { AttendanceSummary } from '@/types/site';
import { AttendanceDay } from '@/types/dashboard';
import { unwrapAttendanceSummary } from '@/lib/utils/site-helpers';
import { normaliseAnalyticsResponse } from '@/lib/utils/dashboard-helpers';
import type { PayrollSummary, PayrollPeriod } from '@/types/payroll';

export async function fetchAttendanceSummary(params: {
  siteId: number | string;
  startDate: string;
  endDate: string;
}): Promise<AttendanceSummary | null> {
  const { siteId, startDate, endDate } = params;
  const res = await api.get(API.attendance.summary, {
    params: { site_id: siteId, start_date: startDate, end_date: endDate },
  });
  return unwrapAttendanceSummary(res.data);
}

export async function fetchAttendanceAnalytics(
  startDate: string,
  endDate: string,
): Promise<AttendanceDay[]> {
  try {
    const res = await api.get(API.attendance.analytics, {
      params: { start_date: startDate, end_date: endDate },
    });
    return normaliseAnalyticsResponse(res.data);
  } catch (err) {
    console.warn('[Attendance] fetch error:', err);
    return [];
  }
}

export async function fetchPayrollSummary(params?: {
  siteId?: number;
  period?: PayrollPeriod;
  startDate?: string;
  endDate?: string;
}): Promise<PayrollSummary> {
  const { siteId, period, startDate, endDate } = params ?? {};
  const res = await api.get(API.attendance.payrollSummary, {
    params: {
      site_id: siteId,
      // Only send one of period OR start_date/end_date — swagger's pattern
      // for `period` is ^(today|week|month)$, custom ranges use the dates instead.
      period: startDate && endDate ? undefined : period,
      start_date: startDate,
      end_date: endDate,
    },
  });

  // Response shape: { code, data: { totallabour, breakdown: [{ siteName, siteId, labourAmount }] }, message }
  const raw = res.data?.data;

  return {
    totalLabour: raw?.totallabour ?? 0,
    breakdown: Array.isArray(raw?.breakdown)
      ? raw.breakdown.map((b: { siteId: number; siteName: string; labourAmount: number }) => ({
          siteId: b.siteId,
          siteName: b.siteName,
          labourAmount: b.labourAmount,
        }))
      : [],
  };
}