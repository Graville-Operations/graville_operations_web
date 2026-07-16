'use client';

import type { Task } from '@/lib/types';
import { getAccentColor } from '@/lib/utils/task-status';
import EmptyState from '@/components/ui/emptystate';
import { Bone } from '@/components/shared/Shimmer';
import TaskListItem from './TaskListItem';

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  siteName: string;
  onSelect: (task: Task) => void;
  onCreateNew: () => void;
  onRetry: () => void;
}

export default function TasksList({
  tasks,
  loading,
  error,
  siteName,
  onSelect,
  onCreateNew,
  onRetry,
}: TasksListProps) {
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gv-card flex items-center gap-4 p-4">
            <Bone w="40px" h="40px" style={{ borderRadius: '0.75rem' }} />
            <div className="flex-1 min-w-0 space-y-2">
              <Bone w="45%" h="0.85rem" />
              <Bone w="65%" h="0.7rem" />
            </div>
            <Bone w="72px" h="1.4rem" style={{ borderRadius: '9999px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && error && tasks.length === 0) {
    return (
      <EmptyState
        fullScreen={false}
        title="Couldn't load tasks"
        description={error}
        action={{ label: 'Retry', onClick: onRetry }}
      />
    );
  }

  if (!loading && !error && tasks.length === 0) {
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