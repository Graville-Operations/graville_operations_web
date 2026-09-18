'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useSiteStore } from '@/store/site-store';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  fetchTransfers,
  fetchTransferDetail,
  actionTransfer,
} from '@/lib/api/transfers';
import { resolveCanApprove } from '@/lib/utils/transfer-approval';
import { formatVehicleLabel } from '@/lib/utils/transfer-format';
import { setTransferRows } from '@/lib/transfers-cache';
import {
  TransferStatus,
  TransferApprovalStatus,
  TransferListItem,
  TransferRow,
  TransferDetail,
  TransferLine,
} from '@/types/transfer';

function flattenLines(detail: TransferDetail | undefined): TransferLine[] {
  if (!detail) return [];
  return [
    ...detail.items.map((i) => ({
      name: i.materialName,
      quantity: i.quantity,
      kind: 'MATERIAL' as const,
    })),
    ...detail.toolItems.map((i) => ({
      name: i.toolName,
      quantity: i.quantity,
      kind: 'TOOL' as const,
    })),
  ];
}

export function useTransfers() {
  const user = useAuthStore((s) => s.user);
  const sitesById = useSiteStore((s) => s.sitesById);
  const userId = user?.id;

  const [rows, setRows] = useState<TransferRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransferStatus | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const { items } = await fetchTransfers();
      const visible: TransferListItem[] = items.filter(
        (t) => t.status !== TransferStatus.DRAFT || t.requestedBy === userId,
      );
      const details = await Promise.allSettled(
        visible.map((t) => fetchTransferDetail(t.id)),
      );

      const detailById = new Map<number, TransferDetail>();
      details.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          detailById.set(visible[idx].id, res.value);
        } else {
          console.warn(`Failed to load detail for transfer ${visible[idx].id}:`, res.reason);
        }
      });

      const built = visible.map((t) => {
        const detail = detailById.get(t.id);
        const approvals = detail?.approvals ?? [];
        return {
          ...t,
          approvals,
          lineItems: flattenLines(detail),
          vehicleLabel: formatVehicleLabel(detail?.transport),
          canApprove: resolveCanApprove(approvals, t.currentStep, userId, t.status),
        };
      });

      setTransferRows(built);
      setRows(built);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load transfers.'));
    } finally {
      if (!opts?.silent) setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const siteName = useCallback(
    (id: number) => sitesById[id]?.name ?? '',
    [sitesById],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) => {
      const matchesStatus = !statusFilter || t.status === statusFilter;
      if (!q) return matchesStatus;
      const haystack = [
        t.pickUpPoint,
        t.dropOffPoint,
        siteName(t.sourceSiteId),
        siteName(t.destinationSiteId),
        t.vehicleLabel,
        ...t.lineItems.map((i) => i.name),
        `TRF-${t.id}`,
        String(t.id),
      ]
        .join(' ')
        .toLowerCase();
      return matchesStatus && haystack.includes(q);
    });
  }, [rows, search, statusFilter, siteName]);

  const pendingMyApprovalCount = useMemo(
    () => rows.filter((t) => t.canApprove).length,
    [rows],
  );

  const act = useCallback(
    async (
      id: number,
      status: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED,
      comment?: string,
    ) => {
      setActionError(null);
      setActioningId(id);
      try {
        await actionTransfer(id, { status, comment: comment || null });
        await load({ silent: true });
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to action transfer.');
        setActionError(message);
        throw new Error(message);
      } finally {
        setActioningId(null);
      }
    },
    [load],
  );

  const hasFilter = !!(search || statusFilter);

  return {
    rows: filtered,
    totalCount: rows.length,
    pendingMyApprovalCount,
    isLoading,
    loadError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasFilter,
    siteName,
    actioningId,
    actionError,
    setActionError,
    act,
    refresh: () => load({ silent: true }),
  };
}