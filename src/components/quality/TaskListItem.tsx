'use client';

import { CalendarRange, Layers } from 'lucide-react';
import type { Task } from '@/lib/types';
import { getTaskStatusConfig } from '@/lib/utils/task-status';
import { formatDisplayDate } from '@/lib/utils/format-display-date';

interface TaskListItemProps {
  task: Task;
  accent: string;
  onSelect: (task: Task) => void;
}

export default function TaskListItem({ task, accent, onSelect }: TaskListItemProps) {
  const status = getTaskStatusConfig(task.status);
  const subtaskCount = task.subtasks?.length ?? 0;

  return (
    <button
      onClick={() => onSelect(task)}
      className="gv-card gv-card-hover w-full text-left flex items-center gap-4 p-4"
    >
      <div className={`shrink-0 w-10 h-10 rounded-xl bg-linear-to-br ${accent} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
        {task.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-(--gv-text-primary) truncate">{task.name}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {(task.start_date || task.end_date) && (
            <span className="flex items-center gap-1 text-xs text-(--gv-text-subtle)">
              <CalendarRange size={11} />
              Start: {formatDisplayDate(task.start_date)} · End: {formatDisplayDate(task.end_date)}
            </span>
          )}
          {subtaskCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-(--gv-text-subtle)">
              <Layers size={11} />
              {subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <span className={`gv-tag flex items-center gap-1 shrink-0 ${status.className}`}>
        {status.icon} {status.label}
      </span>
    </button>
  );
}