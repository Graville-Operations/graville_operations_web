'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUsageDetail } from '@/hooks/stores/useUsageDetail';
import { UsageDetailPageSkeleton, UsageTableSkeleton } from '@/components/stores/UsageDetailSkeletons';
import { ActivityErrorState } from '@/components/stores/ActivityStates';
import { UsageDetailHeader } from '@/components/stores/UsageDetailHeader';
import { ActivityTabBar } from '@/components/stores/ActivityTabBar';
import { DailyUsageTab } from '@/components/stores/DailyUsageTab';
import { OrdersTab } from '@/components/stores/OrdersTab';

export default function StoreActivityDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const usageId = Number(params.usageId);

  const { tab, tabReady, handleTabChange, log, loading, error, refetch } = useUsageDetail(usageId);

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     bg-muted hover:bg-accent
                     text-muted-foreground hover:text-foreground
                     transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <p className="gv-eyebrow">Store · Activity</p>
          <h1 className="text-2xl font-bold mt-0.5">Usage Report</h1>
        </div>
      </div>

      {loading && <UsageDetailPageSkeleton />}

      {!loading && error && (
        <ActivityErrorState message="Failed to load this usage report." onRetry={refetch} />
      )}

      {!loading && !error && log && (
        <>
          <UsageDetailHeader log={log} />

          <ActivityTabBar tab={tab} onTabChange={handleTabChange} />

          {!tabReady && <UsageTableSkeleton cols={3} rows={5} />}
          {tabReady && tab === 'usage'  && <DailyUsageTab log={log} />}
          {tabReady && tab === 'orders' && <OrdersTab usageId={usageId} />}
        </>
      )}

    </div>
  );
}