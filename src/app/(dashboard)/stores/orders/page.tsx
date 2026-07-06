'use client';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { useStoreActivity } from '@/hooks/stores/useStoreActivity';
import { ActivitySiteFilter } from '@/components/stores/ActivitySiteFilter';
import { ActivityDateRangeFilter } from '@/components/stores/ActivityDateRangeFilter';
import { ActivityTileSkeletonGrid } from '@/components/stores/ActivityTileSkeleton';
import { ActivityErrorState, ActivityListEmptyState } from '@/components/stores/ActivityStates';
import { UsageTile } from '@/components/stores/UsageTile';

export default function StoreActivityPage() {
  const router = useRouter();
  const {
    startDate, setStartDate, endDate, setEndDate,
    selectedSiteId, setSelectedSiteId,
    sites, isSitesLoading,
    usageLogs, isUsageLoading, usageError, refetch,
  } = useStoreActivity();

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Store Activity</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Daily usage reports across all sites
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <ActivitySiteFilter
          sites={sites}
          selectedSiteId={selectedSiteId}
          onChange={setSelectedSiteId}
          isLoading={isSitesLoading}
        />
        <ActivityDateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {!isUsageLoading && !usageError && usageLogs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ClipboardList size={12} />
          <span>
            Showing{' '}
            <span className="font-semibold text-foreground">{usageLogs.length}</span>{' '}
            report{usageLogs.length !== 1 ? 's' : ''}
            {selectedSiteId ? ' for selected site' : ' across all sites'}
          </span>
        </div>
      )}

      {isUsageLoading && <ActivityTileSkeletonGrid />}

      {!isUsageLoading && usageError && (
        <ActivityErrorState message="Failed to load usage reports." onRetry={refetch} />
      )}

      {!isUsageLoading && !usageError && usageLogs.length === 0 && (
        <ActivityListEmptyState
          icon={<ClipboardList size={24} />}
          message="No usage reports found"
          hint="Try adjusting the site or date filter"
        />
      )}

      {!isUsageLoading && !usageError && usageLogs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usageLogs.map((log) => (
            <UsageTile
              key={log.id}
              log={log}
              onClick={() => router.push(`/stores/orders/${log.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
}