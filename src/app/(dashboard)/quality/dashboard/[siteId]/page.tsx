'use client';

import { ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/emptystate';
import { useQualitySiteDetail } from '@/hooks/quality/useQualitySiteDetail';
import SiteInfoCard from '@/components/quality/SiteInfoCard';
import TasksList from '@/components/quality/TasksList';
import { ShimmerStyle, Bone } from '@/components/shared/Shimmer';

export default function QualitySiteDetailPage() {
  const {
    site,
    cachedSite,
    tasks,
    loadingSite,
    loadingTasks,
    error,
    tasksError,
    loadSite,
    loadTasks,
    openTask,
    goToCreateTask,
    goBack,
  } = useQualitySiteDetail();

  const handleUpdateBQ = () => {
    toast.info('BQ updates are coming soon — backend support is still in progress.');
  };

  // Only bail out to a full-page failure state when we have neither fresh
  // data nor even a cached name to show — otherwise keep the shell up.
  if (error && !site && !cachedSite) {
    return (
      <EmptyState
        title="Couldn't load this site"
        description={error}
        action={{ label: 'Retry', onClick: loadSite }}
      />
    );
  }

  const displayName = site?.name ?? cachedSite?.name ?? 'Loading…';

  return (
    <div className="gv-page-dashboard">
      <ShimmerStyle />

      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center gap-3">
        <button onClick={goBack} className="gv-btn-outline p-2" aria-label="Back to sites">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--gv-text-primary)] tracking-tight truncate">
            {displayName}
          </h1>
        </div>
        <button onClick={goToCreateTask} className="gv-btn-brand gap-2 text-sm flex-shrink-0">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {loadingSite || !site ? (
          <div className="gv-card p-5 space-y-4">
            <div className="flex gap-2">
              <Bone w="72px" h="1.4rem" style={{ borderRadius: '9999px' }} />
              <Bone w="72px" h="1.4rem" style={{ borderRadius: '9999px' }} />
            </div>
            <Bone w="90%" h="0.85rem" />
            <Bone w="55%" h="0.85rem" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Bone w="35%" h="0.6rem" />
                <Bone w="70%" h="0.9rem" />
              </div>
              <div className="space-y-2">
                <Bone w="35%" h="0.6rem" />
                <Bone w="70%" h="0.9rem" />
              </div>
            </div>
          </div>
        ) : (
          <SiteInfoCard site={site} onUpdateBQ={handleUpdateBQ} />
        )}

        <div>
          <h2 className="text-sm font-semibold text-[var(--gv-text-primary)] mb-3">
            Tasks
            {!loadingTasks && !tasksError && (
              <span className="text-xs text-[var(--gv-text-subtle)] font-normal"> · {tasks.length}</span>
            )}
          </h2>
          <TasksList
            tasks={tasks}
            loading={loadingTasks}
            error={tasksError}
            siteName={displayName}
            onSelect={openTask}
            onCreateNew={goToCreateTask}
            onRetry={loadTasks}
          />
        </div>
      </div>
    </div>
  );
}