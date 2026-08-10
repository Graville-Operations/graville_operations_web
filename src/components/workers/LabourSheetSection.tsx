'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import { usePayrollSummary } from '@/hooks/workers/usePayrollSummary';
import { DateRangePicker } from '@/components/workers/DateRangePicker';
import EmptyState from '@/components/ui/emptystate';
import { ROUTES } from '@/lib/routes';

function toDateStr(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export function LabourSheetSection() {
  const router = useRouter();
  const todayStr = toDateStr(new Date());

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const { summary, loading } = usePayrollSummary({ startDate, endDate });
  const breakdown = summary?.breakdown ?? [];

  const goToSiteDetail = (siteId: number) => {
    router.push(ROUTES.projects.siteDetail(siteId));
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Labour Sheet</h2>
      </div>

      <div className="gv-card flex-1 flex flex-col gap-4">
        {/* Total + Pick Range */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
              Total Labour
            </p>
            {loading ? (
              <div className="w-32 h-8 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
            ) : (
              <p className="text-3xl font-bold" style={{ color: 'var(--gv-brand)' }}>
                {(summary?.totalLabour ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
          <DateRangePicker
            from={startDate}
            to={endDate}
            maxDate={todayStr}
            onChange={(f, t) => { setStartDate(f); setEndDate(t); }}
          />
        </div>

        <div className="h-px" style={{ background: 'var(--gv-glass-border)' }} />

        {/* Per-site breakdown, each entry a distinct clickable card */}
        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
              ))}
            </div>
          ) : breakdown.length === 0 ? (
            <EmptyState
              title="No labour recorded"
              description="No labour amounts found for this date range."
              fullScreen={false}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-72 pr-1">
              {breakdown.map((b) => (
                <button
                  key={b.siteId}
                  onClick={() => goToSiteDetail(b.siteId)}
                  className="flex items-start justify-between gap-2 p-4 rounded-xl border border-(--gv-glass-border) bg-(--gv-glass-bg) hover:bg-(--gv-glass-bg-strong) hover:border-(--gv-glass-border-hover) transition-all cursor-pointer text-left active:scale-[0.98]"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {b.siteName}
                    </span>
                    <span className="text-lg font-bold" style={{ color: 'var(--gv-brand)' }}>
                      {b.labourAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <ArrowUpRight size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--gv-text-subtle)' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}