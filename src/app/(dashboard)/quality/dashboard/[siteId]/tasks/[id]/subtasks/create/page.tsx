'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import EmptyState from '@/components/ui/emptystate';
import { useCreateSubtaskForm } from '@/hooks/quality/useCreateSubtaskForm';
import FormErrorBanner from '@/components/quality/FormErrorBanner';
import TaskBasicFields from '@/components/quality/TaskBasicFields';
import WorkerAssignmentPicker from '@/components/quality/WorkerAssignmentPicker';

export default function CreateSubtaskPage() {
  const {
    taskId,
    form,
    updateField,
    filteredWorkers,
    loadingWorkers,
    workersError,
    selectedWorkers,
    toggleWorker,
    workerSearch,
    setWorkerSearch,
    submitting,
    error,
    handleSubmit,
    goBack,
  } = useCreateSubtaskForm();

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
      <div className="gv-nav sticky top-0 z-20 px-4 sm:px-6 flex items-center gap-3">
        <button onClick={goBack} className="gv-btn-outline p-2 w-9 h-9 rounded-xl shrink-0">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-(--gv-text-primary) tracking-tight">Create Subtask</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-5">
        {error && <FormErrorBanner message={error} />}

        <TaskBasicFields
          name={form.name}
          description={form.description}
          onChangeName={(v) => updateField('name', v)}
          onChangeDescription={(v) => updateField('description', v)}
          namePlaceholder="e.g. Foundation Inspection"
          descriptionPlaceholder="Details about this subtask…"
          descriptionRows={3}
        />

        <WorkerAssignmentPicker
          workers={filteredWorkers}
          loading={loadingWorkers}
          error={workersError}
          selectedWorkers={selectedWorkers}
          onToggleWorker={toggleWorker}
          search={workerSearch}
          onSearchChange={setWorkerSearch}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim()}
          className="gv-btn-brand w-full py-3.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating…
            </>
          ) : (
            'Create Subtask'
          )}
        </button>
      </div>
    </div>
  );
}