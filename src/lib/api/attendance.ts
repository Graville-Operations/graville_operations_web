import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { AttendanceSummary } from '@/types/site';
import { AttendanceDay } from '@/types/dashboard';
import { unwrapObject } from '@/lib/api-response';
import { normaliseAttendanceSummary } from '@/lib/mappers/site-mappers';
import type { AttendanceSummaryDTO } from '@/types/site';
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
  const dto = unwrapObject<AttendanceSummaryDTO | null>(res.data);
  return dto && Array.isArray(dto.records) ? normaliseAttendanceSummary(dto) : null;
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

interface RawPayrollBreakdown {
  siteId: number;
  siteName: string;
  labourAmount: number;
}

interface RawPayrollSummary {
  totallabour?: number;
  breakdown?: RawPayrollBreakdown[];
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
      period: startDate && endDate ? undefined : period,
      start_date: startDate,
      end_date: endDate,
    },
  });

  const raw = unwrapObject<RawPayrollSummary>(res.data);

  return {
    totalLabour: raw?.totallabour ?? 0,
    breakdown: Array.isArray(raw?.breakdown)
      ? raw.breakdown.map((b) => ({
          siteId: b.siteId,
          siteName: b.siteName,
          labourAmount: b.labourAmount,
        }))
      : [],
  };
}