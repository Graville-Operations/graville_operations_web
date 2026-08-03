'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { TaskBreakdownItem } from '@/types/site';
import { ProgressBar } from '@/components/shared/ProgressBar';
export function AnalyticsTaskRow({ task }: { task: TaskBreakdownItem }) {
  const [open, setOpen] = useState(false);
  const subtasks = task.subtaskBreakdown ?? [];
  const total    = subtasks.length;
  const totalPct = subtasks.reduce((a, s) => a + s.completionPercentage, 0);
  const taskPct  = total > 0 ? Math.min(100, Math.round(totalPct / total)) : 0;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)' }}>
          <CheckCircle2 className={`w-4 h-4 ${taskPct === 100 ? 'text-teal-300' : 'text-blue-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{task.taskName}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar pct={taskPct} color={taskPct === 100 ? '#14b8a6' : 'var(--gv-brand)'} height="h-1.5" />
            </div>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
              {taskPct}%
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-subtle)' }}>
            {total > 0 ? `${total} subtask${total !== 1 ? 's' : ''}` : 'No subtasks'}
            {total > 0 ? ` · ${taskPct}% completion` : ''}
          </p>
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />}
      </button>
      {open && subtasks.length > 0 && (
        <div className="px-4 pb-3 space-y-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          {subtasks.map((sub, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 py-2 px-3 rounded-xl"
              style={{ background: 'var(--gv-glass-bg-strong)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-white truncate">{sub.subtaskName}</span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--gv-brand)' }}>
                  {sub.completionPercentage}%
                </span>
              </div>
              <ProgressBar
                pct={sub.completionPercentage}
                color={sub.completionPercentage === 100 ? '#14b8a6' : 'var(--gv-brand)'}
                height="h-1"
              />
            </div>
          ))}
        </div>
      )}
      {open && subtasks.length === 0 && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--gv-text-subtle)' }}>No subtasks recorded</p>
        </div>
      )}
    </div>
  );
}