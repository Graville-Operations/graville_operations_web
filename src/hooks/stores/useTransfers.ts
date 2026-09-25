'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [detailLoadedIds, setDetailLoadedIds] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransferStatus | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadSeq = useRef(0);

  const buildRow = useCallback(
    (t: TransferListItem, detail?: TransferDetail): TransferRow => {
      const approvals = detail?.approvals ?? [];
      return {
        ...t,
        approvals,
        lineItems: flattenLines(detail),
        vehicleLabel: formatVehicleLabel(detail?.transport),
        canApprove: resolveCanApprove(approvals, t.currentStep, userId, t.status),
      };
    },
    [userId],
  );

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    const seq = ++loadSeq.current;
    if (!silent) setIsLoading(true);
    setLoadError(null);
    try {
      const { items } = await fetchTransfers();
      const visible: TransferListItem[] = items.filter(
        (t) => t.status !== TransferStatus.DRAFT || t.requestedBy === userId,
      );

      if (silent) {
        const details = await Promise.allSettled(
          visible.map((t) => fetchTransferDetail(t.id)),
        );
        if (seq !== loadSeq.current) return;
        const built = visible.map((t, idx) => {
          const res = details[idx];
          if (res.status === 'rejected') {
            console.warn(`Failed to load detail for transfer ${t.id}:`, res.reason);
          }
          return buildRow(t, res.status === 'fulfilled' ? res.value : undefined);
        });
        setTransferRows(built);
        setRows(built);
        setDetailLoadedIds(new Set(visible.map((t) => t.id)));
        return;
      }

      setRows(visible.map((t) => buildRow(t)));
      setDetailLoadedIds(new Set());
      setIsLoading(false);

      await Promise.allSettled(
        visible.map(async (t) => {
          let detail: TransferDetail | undefined;
          try {
            detail = await fetchTransferDetail(t.id);
          } catch (err) {
            console.warn(`Failed to load detail for transfer ${t.id}:`, err);
          }
          if (seq !== loadSeq.current) return;

          const row = buildRow(t, detail);
          if (detail) setTransferRows([row]);
          setRows((prev) => prev.map((r) => (r.id === t.id ? row : r)));
          setDetailLoadedIds((prev) => new Set(prev).add(t.id));
        }),
      );
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load transfers.'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [userId, buildRow]);

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
    detailLoadedIds,
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