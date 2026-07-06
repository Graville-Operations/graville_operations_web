'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStockRegisters } from '@/hooks/stores/useStockRegisters';
import { StatCard } from '@/components/stores/StatCard';
import { SiteSelector } from '@/components/stores/SiteSelector';
import { CardSkeleton, TableSkeleton } from '@/components/stores/StoreSkeletons';
import { MaterialsRegisterTable } from '@/components/stores/MaterialsRegisterTable';
import { ToolsRegisterTable } from '@/components/stores/ToolsRegisterTable';
import { StockSummaryBadges } from '@/components/stores/StockSummaryBadges';
import { StockToolbar } from '@/components/stores/StockToolbar';
import { StockErrorState } from '@/components/stores/StockErrorState';
import { getStockStatCards } from '@/components/stores/statCards';

export default function StockRegistersPage() {
  const router = useRouter();
  const {
    sites, isSitesLoading, resolvedSiteId, handleSiteChange,
    tab, handleTabChange, search, setSearch,
    summary, showCardSkeletons,
    filteredMaterials, filteredTools, materials, tools,
    lowCount, outCount, availTool, overdueTool, damagedTools,
    isCurrentLoading, isCurrentError,
    refetchMats, refetchTools,
  } = useStockRegisters();

  const statCards = useMemo(() => {
    if (!summary || !resolvedSiteId) return [];
    return getStockStatCards(summary, damagedTools, {
      toMaterials: () => router.push(`/stores/materials/${resolvedSiteId}`),
      toTools:     () => router.push(`/stores/tools/${resolvedSiteId}`),
    });
  }, [summary, resolvedSiteId, damagedTools, router]);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Store</p>
          <h1 className="text-2xl font-bold mt-1">Stock Registers</h1>
        </div>
        <SiteSelector
          sites={sites}
          selectedSiteId={resolvedSiteId}
          onChange={handleSiteChange}
          isLoading={isSitesLoading}
        />
      </div>

      {showCardSkeletons && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!showCardSkeletons && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {!isCurrentLoading && resolvedSiteId && (
        <StockSummaryBadges
          materialCount={materials.length}
          toolCount={tools.length}
          lowCount={lowCount}
          outCount={outCount}
          availTool={availTool}
          overdueTool={overdueTool}
          damagedTools={damagedTools}
        />
      )}

      <StockToolbar
        tab={tab}
        onTabChange={handleTabChange}
        search={search}
        onSearchChange={setSearch}
      />

      {isCurrentLoading && <TableSkeleton cols={tab === 'materials' ? 3 : 4} />}

      {!isCurrentLoading && isCurrentError && (
        <StockErrorState
          label={tab}
          onRetry={tab === 'materials' ? refetchMats : refetchTools}
        />
      )}

      {!isCurrentLoading && !isCurrentError && tab === 'materials' && (
        <MaterialsRegisterTable items={filteredMaterials} search={search} />
      )}

      {!isCurrentLoading && !isCurrentError && tab === 'tools' && (
        <ToolsRegisterTable items={filteredTools} search={search} />
      )}

    </div>
  );
}