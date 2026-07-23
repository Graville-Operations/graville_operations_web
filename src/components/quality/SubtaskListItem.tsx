'use client';

import { Users } from 'lucide-react';
import type { SubTask } from '@/lib/types';
import { getTaskStatusConfig } from '@/lib/utils/task-status';

interface SubtaskListItemProps {
  subtask: SubTask;
}

export default function SubtaskListItem({ subtask }: SubtaskListItemProps) {
  const status = getTaskStatusConfig(subtask.status);
  const workerCount = subtask.assigned_workers?.length ?? 0;

  return (
    <div className="gv-card w-full text-left flex items-center gap-4 p-4">
      <div className="shrink-0 w-2 h-2 rounded-full bg-(--gv-brand) mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-(--gv-text-primary) truncate">{subtask.name}</p>
        {subtask.description && (
          <p className="text-xs text-(--gv-text-subtle) truncate mt-0.5">{subtask.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-(--gv-text-subtle)">
            {subtask.completion_percentage}% complete
          </span>
          {workerCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-(--gv-text-subtle)">
              <Users size={11} />
              {workerCount} worker{workerCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <span className={`gv-tag flex items-center gap-1 shrink-0 ${status.className}`}>
        {status.icon} {status.label}
      </span>
    </div>
  );
}