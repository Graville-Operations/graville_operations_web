'use client';

import { Layers, Loader2 } from 'lucide-react';
import type { SubTask } from '@/lib/types';
import EmptyState from '@/components/ui/emptystate';
import SubtaskListItem from './SubtaskListItem';

interface SubtasksSectionProps {
  subtasks: SubTask[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreateNew: () => void;
}

export default function SubtasksSection({
  subtasks,
  loading,
  error,
  onRetry,
  onCreateNew,
}: SubtasksSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-(--gv-text-primary) flex items-center gap-2">
          <Layers size={14} className="text-(--gv-brand)" />
          Subtasks
          {subtasks.length > 0 && (
            <span className="text-xs text-(--gv-text-subtle) font-normal">· {subtasks.length}</span>
          )}
        </h2>
      </div>

      {error && subtasks.length === 0 && (
        <EmptyState
          fullScreen={false}
          title="Couldn't load subtasks"
          description={error}
          action={{ label: 'Retry', onClick: onRetry }}
        />
      )}

      {loading && subtasks.length === 0 && !error && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-(--gv-glass-bg) animate-pulse" />
          ))}
        </div>
      )}

      {loading && subtasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-(--gv-text-subtle) mb-2">
          <Loader2 size={12} className="animate-spin" /> Refreshing…
        </div>
      )}

      {!loading && !error && subtasks.length === 0 && (
        <EmptyState
          fullScreen={false}
          title="No subtasks yet"
          description="Break this task down into subtasks to track progress in detail."
          action={{ label: 'Add Subtask', onClick: onCreateNew }}
        />
      )}

      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((sub) => (
            <SubtaskListItem key={sub.id} subtask={sub} />
          ))}
        </div>
      )}
    </div>
  );
}