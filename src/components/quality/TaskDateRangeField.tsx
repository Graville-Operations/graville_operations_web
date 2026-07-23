'use client';

import { CalendarRange } from 'lucide-react';

interface TaskDateRangeFieldProps {
  startDate: string;
  endDate: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  summary: string | null;
}

export default function TaskDateRangeField({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  summary,
}: TaskDateRangeFieldProps) {
  return (
    <div>
      <label className="gv-label flex items-center gap-1.5">
        <CalendarRange size={12} />
        Date Range <span className="text-red-400">*</span>
      </label>
      <div className="gv-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="gv-eyebrow block mb-1.5">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStart(e.target.value)}
              className="gv-input scheme-dark"
            />
          </div>
          <div>
            <span className="gv-eyebrow block mb-1.5">End date</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => onChangeEnd(e.target.value)}
              className="gv-input scheme-dark"
            />
          </div>
        </div>
        {summary && (
          <p className="text-xs text-(--gv-brand) flex items-center gap-1.5">
            <CalendarRange size={11} /> {summary}
          </p>
        )}
      </div>
    </div>
  );
}