'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useTaskDetail } from '@/hooks/quality/useTaskDetail';
import TaskInfoCard from '@/components/quality/TaskInfoCard';
import SubtasksSection from '@/components/quality/SubtasksSection';
import OfflineBanner from '@/components/quality/OfflineBanner';

export default function TaskDetailPage() {
  const {
    taskId,
    task,
    taskMissing,
    site,
    subtasks,
    loadingSubs,
    subsError,
    offline,
    loadSubtasks,
    goToCreateSubtask,
    goBack,
  } = useTaskDetail();

  if (!Number.isFinite(taskId)) {
    return (
      <EmptyState
        title="Invalid Task"
        description="This task link is malformed or the task couldn't be identified."
      />
    );
  }

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-4 sm:px-6 flex items-center gap-3 flex-wrap">
        <button onClick={goBack} className="gv-btn-outline p-2 w-9 h-9 rounded-xl shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-(--gv-text-primary) tracking-tight truncate">
            {task?.name ?? (taskMissing ? 'Task' : 'Loading…')}
          </h1>
          {site && <p className="gv-eyebrow mt-0.5">{site.name}</p>}
        </div>
        <button
          onClick={goToCreateSubtask}
          className="gv-btn-brand gap-2 text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Add Subtask
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">

        {offline && <OfflineBanner message="You're offline — showing cached subtasks." />}

        {taskMissing && (
          <EmptyState
            fullScreen={false}
            title="Task Details Unavailable"
            description="Open this task from the Tasks list rather than a direct link or page reload — task details aren't cached until then."
          />
        )}

        {task && <TaskInfoCard task={task} />}

        <SubtasksSection
          subtasks={subtasks}
          loading={loadingSubs}
          error={subsError}
          onRetry={loadSubtasks}
          onCreateNew={goToCreateSubtask}
        />
      </div>
    </div>
  );
}