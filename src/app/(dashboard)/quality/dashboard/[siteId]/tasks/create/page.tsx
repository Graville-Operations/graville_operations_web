'use client';

import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { useCreateTaskForm } from '@/hooks/quality/useCreateTaskForm';
import FormErrorBanner from '@/components/quality/FormErrorBanner';
import TaskBasicFields from '@/components/quality/TaskBasicFields';
import TaskDateRangeField from '@/components/quality/TaskDateRangeField';

export default function CreateTaskPage() {
  const {
    site,
    form,
    updateField,
    dateRangeSummary,
    canSubmit,
    submitting,
    error,
    handleSubmit,
    goBack,
  } = useCreateTaskForm();

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center gap-3">
        <button onClick={goBack} className="gv-btn-outline p-2 w-9 h-9 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-(--gv-text-primary) tracking-tight">Create Task</h1>
          {site && (
            <p className="gv-eyebrow mt-0.5 flex items-center gap-1.5">
              <Building2 size={11} /> {site.name}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-5">
        {error && <FormErrorBanner message={error} />}

        <TaskBasicFields
          name={form.name}
          description={form.description}
          onChangeName={(v) => updateField('name', v)}
          onChangeDescription={(v) => updateField('description', v)}
          namePlaceholder="e.g. SubStructure Works"
          descriptionPlaceholder="Brief description of the task…"
        />

        <TaskDateRangeField
          startDate={form.start_date}
          endDate={form.end_date}
          onChangeStart={(v) => updateField('start_date', v)}
          onChangeEnd={(v) => updateField('end_date', v)}
          summary={dateRangeSummary}
        />

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gv-btn-brand w-full py-3.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating…
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </div>
  );
}