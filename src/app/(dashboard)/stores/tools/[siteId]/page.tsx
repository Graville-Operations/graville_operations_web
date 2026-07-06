'use client';
import { useParams } from 'next/navigation';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToolsDetail } from '@/hooks/stores/useToolsDetail';
import { DetailPageHeader } from '@/components/stores/DetailPageHeader';
import { ToolsTabBar } from '@/components/stores/ToolsTabBar';
import { ToolsDetailSkeleton } from '@/components/stores/ToolsDetailSkeleton';
import { ToolsDetailTable } from '@/components/stores/ToolsDetailTable';
import { LoadMoreButton } from '@/components/stores/LoadMoreButton';

export default function ToolsPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = Number(params.siteId);

  const {
    siteName, activeTab, handleTabChange,
    items, loading, error, hasMore, loadingMore, loadMore,
  } = useToolsDetail(siteId);

  return (
    <div className="space-y-4">

      <DetailPageHeader
        icon={<Activity size={16} className="text-primary" />}
        title="Tools"
        siteName={siteName}
      />

      <ToolsTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {loading && !items.length && <ToolsDetailSkeleton />}

      {!loading && error && !items.length && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={32} className="text-destructive opacity-40 mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load tools.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium mb-1">No tools in this category</p>
          <p className="text-xs text-muted-foreground">
            Try switching to a different tab.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <ToolsDetailTable items={items} />
          {hasMore && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
        </>
      )}

    </div>
  );
}