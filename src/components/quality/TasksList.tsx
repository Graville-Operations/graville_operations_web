'use client';

import type { Task } from '@/lib/types';
import { getAccentColor } from '@/lib/utils/task-status';
import EmptyState from '@/components/ui/emptystate';
import TaskListItem from './TaskListItem';

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  offline: boolean;
  siteName: string;
  onSelect: (task: Task) => void;
  onCreateNew: () => void;
}

export default function TasksList({ tasks, loading, offline, siteName, onSelect, onCreateNew }: TasksListProps) {
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-(--gv-glass-bg) animate-pulse" />
        ))}
      </div>
    );
  }

  if (!loading && !offline && tasks.length === 0) {
    return (
      <EmptyState
        fullScreen={false}
        title="No tasks yet"
        description={`${siteName} doesn't have any tasks yet. Create the first one to get started.`}
        action={{ label: 'Create Task', onClick: onCreateNew }}
      />
    );
  }

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      {tasks.map((task, idx) => (
        <TaskListItem key={task.id} task={task} accent={getAccentColor(idx)} onSelect={onSelect} />
      ))}
    </div>
  );
}