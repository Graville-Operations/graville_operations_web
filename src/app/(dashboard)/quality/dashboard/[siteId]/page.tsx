'use client';

import { ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/emptystate';
import { useQualitySiteDetail } from '@/hooks/quality/useQualitySiteDetail';
import OfflineBanner from '@/components/quality/OfflineBanner';
import SiteInfoCard from '@/components/quality/SiteInfoCard';
import TasksList from '@/components/quality/TasksList';

export default function QualitySiteDetailPage() {
  const {
    site,
    tasks,
    loadingSite,
    loadingTasks,
    error,
    offline,
    loadSite,
    loadTasks,
    openTask,
    goToCreateTask,
    goBack,
  } = useQualitySiteDetail();

  const handleUpdateBQ = () => {
    toast.info('BQ updates are coming soon — backend support is still in progress.');
  };

  if (loadingSite) {
    return (
      <div className="gv-page-dashboard">
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-4">
          <div className="h-8 w-48 rounded-lg bg-(--gv-glass-bg) animate-pulse" />
          <div className="h-40 rounded-2xl bg-(--gv-glass-bg) animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !site) {
    return (
      <EmptyState
        title="Couldn't load this site"
        description={error}
        action={{ label: 'Retry', onClick: loadSite }}
      />
    );
  }

  if (!site) return null;

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center gap-3">
        <button onClick={goBack} className="gv-btn-outline p-2" aria-label="Back to sites">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-(--gv-text-primary) tracking-tight truncate">{site.name}</h1>
        </div>
        <button onClick={goToCreateTask} className="gv-btn-brand gap-2 text-sm shrink-0">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        <SiteInfoCard site={site} onUpdateBQ={handleUpdateBQ} />

        {offline && (
          <OfflineBanner message="Tasks failed to load — check your connection." onRetry={loadTasks} />
        )}

        <div>
          <h2 className="text-sm font-semibold text-(--gv-text-primary) mb-3">
            Tasks
            {!loadingTasks && (
              <span className="text-xs text-(--gv-text-subtle) font-normal">
                {' '}· {tasks.length}
              </span>
            )}
          </h2>
          <TasksList
            tasks={tasks}
            loading={loadingTasks}
            offline={offline}
            siteName={site.name}
            onSelect={openTask}
            onCreateNew={goToCreateTask}
          />
        </div>
      </div>
    </div>
  );
}