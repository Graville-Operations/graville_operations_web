'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchPayrollSummary } from '@/lib/api/attendance';
import type { PayrollSummary, PayrollPeriod } from '@/types/payroll';

export function usePayrollSummary(params: {
  siteId?: number | null;
  period?: PayrollPeriod;
  startDate?: string;
  endDate?: string;
}) {
  const { siteId, period, startDate, endDate } = params;
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPayrollSummary({
        siteId: siteId ?? undefined,
        period,
        startDate,
        endDate,
      });
      setSummary(data);
    } catch (err) {
      console.error('[usePayrollSummary] load failed:', err);
      setError('Failed to load payroll summary.');
    } finally {
      setLoading(false);
    }
  }, [siteId, period, startDate, endDate]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return { summary, loading, error, reload: load };
}