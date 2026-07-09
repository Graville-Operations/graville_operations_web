'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardMetrics } from '@/lib/api/sites';
import { fetchAttendanceAnalytics } from '@/lib/api/attendance';
import { DashboardMetrics, Bar, AttendanceTab } from '@/types/dashboard';
import { buildDateRange, buildBars } from '@/lib/utils/dashboard-helpers';

export function useProjectsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [attendanceTab, setAttendanceTab] = useState<AttendanceTab>('Today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  const [bars, setBars]               = useState<Bar[]>([]);
  const [loadingBars, setLoadingBars] = useState(false);
  const [barsError, setBarsError]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.warn('[Dashboard] fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadBars = useCallback(async () => {
    const range = buildDateRange(attendanceTab, dateFrom, dateTo);
    if (!range) { setBars([]); return; }
    setLoadingBars(true);
    setBarsError(null);
    try {
      const summary = await fetchAttendanceAnalytics(range.from, range.to);
      setBars(buildBars(summary, range.from, range.to, attendanceTab));
    } catch {
      setBarsError('Could not load attendance data.');
      setBars(buildBars([], range.from, range.to, attendanceTab));
    } finally {
      setLoadingBars(false);
    }
  }, [attendanceTab, dateFrom, dateTo]);

  useEffect(() => { loadBars(); }, [loadBars]);

  return {
    metrics, loading, load,
    attendanceTab, setAttendanceTab,
    dateFrom, setDateFrom, dateTo, setDateTo,
    bars, loadingBars, barsError, loadBars,
  };
}