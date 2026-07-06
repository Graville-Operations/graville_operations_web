'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { fetchSiteById, fetchSiteAnalytics } from '@/lib/api/sites';
import { fetchAttendanceSummary } from '@/lib/api/attendance';
import { SiteAnalytics, SiteDetailExtended, RawSite } from '@/types/site-detail';
import { AttendanceRecord } from '@/types/site';
import { normalizeTaskBreakdown } from '@/lib/utils/site-helpers';

export function useSiteDetail(site: RawSite) {
  const [analytics, setAnalytics]         = useState<SiteAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [detail, setDetail]               = useState<SiteDetailExtended | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [rangeRecords, setRangeRecords] = useState<AttendanceRecord[]>([]);
  const [rangePayouts, setRangePayouts] = useState<number>(0);
  const [loadingRange, setLoadingRange] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [rangeFrom, setRangeFrom] = useState(todayStr);
  const [rangeTo, setRangeTo]     = useState(todayStr);

  const loadAnalytics = useCallback(() => {
    setLoadingAnalytics(true);
    fetchSiteAnalytics(site.id)
      .then((a) => {
        if (!a) { setAnalytics(a); return; }
        const rawTaskBreakdown =
          (a as unknown as Record<string, unknown>).taskBreakdown ??
          (a as unknown as Record<string, unknown>).task_breakdown ??
          (a as unknown as Record<string, unknown>).tasks ??
          (a as unknown as Record<string, unknown>).task_list;
        setAnalytics({ ...a, taskBreakdown: normalizeTaskBreakdown(rawTaskBreakdown) });
      })
      .catch(() => {})
      .finally(() => setLoadingAnalytics(false));
  }, [site.id]);

  const loadDetail = useCallback(() => {
    setLoadingDetail(true);
   fetchSiteById(site.id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [site.id]);

  const loadRange = useCallback((from: string, to: string) => {
    if (!from || !to) return;
    setLoadingRange(true);
    fetchAttendanceSummary({ siteId: site.id, startDate: from, endDate: to })
      .then((summary) => {
        setRangeRecords(summary?.records ?? []);
        setRangePayouts(summary?.payouts ?? 0);
      })
      .catch(() => { setRangeRecords([]); setRangePayouts(0); })
      .finally(() => setLoadingRange(false));
  }, [site.id]);

  useEffect(() => { loadDetail(); loadAnalytics(); }, [loadDetail, loadAnalytics]);
  useEffect(() => { loadRange(rangeFrom, rangeTo); }, [rangeFrom, rangeTo, loadRange]);

  const estimatedValue   = analytics?.estimatedProjectValue ?? detail?.estimatedValue ?? 0;
  const totalExpenditure = analytics?.totalExpenditure      ?? 0;
  const expendRemaining  = analytics?.expenditureRemaining  ?? 0;
  const availableBudget  = expendRemaining >= 0 ? expendRemaining : 0;
  const projectCompletion = analytics?.projectCompletionPercentage ?? 0;
  const timePct            = analytics?.timeCompletionPercentage    ?? 0;
  const todayAttendance     = analytics?.todayAttendance     ?? 0;
  const previousAttendance  = analytics?.previousAttendance  ?? 0;
  const attendanceBreakdown = analytics?.attendanceBreakdown ?? [];
  const taskBreakdown       = analytics?.taskBreakdown       ?? [];
  const completedTasks      = analytics?.completedTasks      ?? 0;
  const totalWorkers        = analytics?.totalWorkers        ?? 0;

  const rangeLabel = rangeFrom === rangeTo
    ? format(parseISO(rangeFrom), 'dd MMM yyyy')
    : `${format(parseISO(rangeFrom), 'dd MMM')} – ${format(parseISO(rangeTo), 'dd MMM yyyy')}`;

  return {
    detail, loadingDetail,
    analytics, loadingAnalytics,
    rangeRecords, rangePayouts, loadingRange,
    rangeFrom, rangeTo, setRangeFrom, setRangeTo, todayStr, rangeLabel,
    derived: {
      estimatedValue, totalExpenditure, availableBudget,
      projectCompletion, timePct, todayAttendance, previousAttendance,
      attendanceBreakdown, taskBreakdown, completedTasks, totalWorkers,
    },
  };
}