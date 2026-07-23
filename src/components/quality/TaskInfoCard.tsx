'use client';

import { CalendarRange } from 'lucide-react';
import type { Task } from '@/lib/types';
import { getTaskStatusConfig } from '@/lib/utils/task-status';
import { formatDisplayDate } from '@/lib/utils/format-display-date';

interface TaskInfoCardProps {
  task: Task;
}

export default function TaskInfoCard({ task }: TaskInfoCardProps) {
  const status = getTaskStatusConfig(task.status);

  return (
    <div className="gv-card p-5 space-y-4">
      <div>
        <p className="gv-label mb-1">Status</p>
        <span className={`gv-tag inline-flex items-center gap-1 ${status.className}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div>
        <p className="gv-label mb-1">Start Date</p>
        <p className="flex items-center gap-2 text-sm font-medium text-(--gv-text-primary)">
          <CalendarRange size={14} className="text-(--gv-text-subtle) shrink-0" />
          {formatDisplayDate(task.start_date)}
        </p>
      </div>

      <div>
        <p className="gv-label mb-1">End Date</p>
        <p className="flex items-center gap-2 text-sm font-medium text-(--gv-text-primary)">
          <CalendarRange size={14} className="text-(--gv-text-subtle) shrink-0" />
          {formatDisplayDate(task.end_date)}
        </p>
      </div>

      {task.description && (
        <div>
          <p className="gv-label mb-1">Description</p>
          <p className="text-sm text-(--gv-text-muted) leading-relaxed">{task.description}</p>
        </div>
      )}
    </div>
  );
}