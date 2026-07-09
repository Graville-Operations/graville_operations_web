'use client';
import { useParams } from 'next/navigation';
import { Package, AlertTriangle } from 'lucide-react';
import { useMaterialsDetail } from '@/hooks/stores/useMaterialsDetail';
import { DetailPageHeader } from '@/components/stores/DetailPageHeader';
import { MaterialsDetailSkeleton } from '@/components/stores/MaterialsDetailSkeleton';
import { MaterialsDetailTable } from '@/components/stores/MaterialsDetailTable';
import { LoadMoreButton } from '@/components/stores/LoadMoreButton';

export default function MaterialsPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = Number(params.siteId);

  const {
    siteName, items, col1, col2, col3,
    loading, error, hasMore, loadingMore, loadMore,
  } = useMaterialsDetail(siteId);

  return (
    <div className="space-y-4">

      <DetailPageHeader
        icon={<Package size={16} className="text-primary" />}
        title="Materials Details"
        siteName={siteName}
      />

      {loading && !items.length && <MaterialsDetailSkeleton />}

      {!loading && error && !items.length && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={32} className="text-destructive opacity-40 mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load materials.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center">
          <Package size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium mb-1">No materials registered</p>
          <p className="text-xs text-muted-foreground">
            Add materials to this site to see them here.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 items-start">
            <MaterialsDetailTable items={col1} />
            <MaterialsDetailTable items={col2} />
            <MaterialsDetailTable items={col3} />
          </div>

          {hasMore && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
        </>
      )}

    </div>
  );
}