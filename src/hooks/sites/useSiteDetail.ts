'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { fetchSiteById, fetchSiteAnalytics, updateSite } from '@/lib/api/sites';
import { fetchAttendanceSummary } from '@/lib/api/attendance';
import { SiteAnalytics, AttendanceRecord, SiteDetail, UpdateSitePayload } from '@/types/site';
import { normalizeTaskBreakdown } from '@/lib/utils/site-helpers';
import { useSiteStore } from '@/store/site-store';

export function useSiteDetail(siteId: number) {
  const [analytics, setAnalytics]         = useState<SiteAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [detail, setDetail]               = useState<SiteDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [updatingSite, setUpdatingSite]   = useState(false);
  const [updateSiteError, setUpdateSiteError] = useState<string | null>(null);

  const [rangeRecords, setRangeRecords] = useState<AttendanceRecord[]>([]);
  const [rangePayouts, setRangePayouts] = useState<number>(0);
  const [loadingRange, setLoadingRange] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [rangeFrom, setRangeFrom] = useState(todayStr);
  const [rangeTo, setRangeTo]     = useState(todayStr);

  const fetchSitesAction = useSiteStore((s) => s.fetchSites);

  const loadAnalytics = useCallback(() => {
    setLoadingAnalytics(true);
    fetchSiteAnalytics(siteId)
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
  }, [siteId]);

  const loadDetail = useCallback(() => {
    setLoadingDetail(true);
    return fetchSiteById(siteId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [siteId]);

  const loadRange = useCallback((from: string, to: string) => {
    if (!from || !to) return;
    setLoadingRange(true);
    fetchAttendanceSummary({ siteId, startDate: from, endDate: to })
      .then((summary) => {
        setRangeRecords(summary?.records ?? []);
        setRangePayouts(summary?.payouts ?? 0);
      })
      .catch(() => { setRangeRecords([]); setRangePayouts(0); })
      .finally(() => setLoadingRange(false));
  }, [siteId]);

  const updateSiteDetail = useCallback(async (payload: UpdateSitePayload) => {
    setUpdatingSite(true);
    setUpdateSiteError(null);
    try {
      await updateSite(siteId, payload);
      await loadDetail();
      await fetchSitesAction(true);
    } catch (err) {
      setUpdateSiteError(err instanceof Error ? err.message : 'Failed to update site');
      throw err;
    } finally {
      setUpdatingSite(false);
    }
  }, [siteId, loadDetail, fetchSitesAction]);

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
    detail, loadingDetail, refreshDetail: loadDetail,
    updatingSite, updateSiteError, updateSiteDetail,
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