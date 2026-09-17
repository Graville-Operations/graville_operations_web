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
import {
  TransferStatus,
  TransferApprovalStatus,
  TransferRow,
  TransferDetail,
  TransferLine,
  TransportBrief,
} from '@/types/transfer';

/** "Isuzu · KDQ 564M", collapsing the duplicate when the vehicle was saved
 *  with its plate as the name. */
function formatVehicle(transport: TransportBrief | null | undefined): string {
  if (!transport) return '';
  const name = (transport.name ?? '').trim();
  const plate = (transport.numberPlate ?? '').trim();
  if (name && plate && name.toLowerCase() !== plate.toLowerCase()) {
    return `${name} · ${plate}`;
  }
  return name || plate;
}

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

      // MaterialTransferListResponse carries only counts and a transport_id —
      // no item names, no transport name, no approvals. The table now shows
      // Item / Quantity / Vehicle per row, so every row needs its detail.
      // allSettled so one bad id can't blank the whole table.
      const details = await Promise.allSettled(
        items.map((t) => fetchTransferDetail(t.id)),
      );

      const detailById = new Map<number, TransferDetail>();
      details.forEach((res, idx) => {
        if (res.status === 'fulfilled') detailById.set(items[idx].id, res.value);
      });

      setRows(
        items.map((t) => {
          const detail = detailById.get(t.id);
          const approvals = detail?.approvals ?? [];
          return {
            ...t,
            approvals,
            lineItems: flattenLines(detail),
            vehicleLabel: formatVehicle(detail?.transport),
            canApprove: resolveCanApprove(approvals, t.currentStep, userId),
          };
        }),
      );
    } catch (err) {
      // Keep whatever is already on screen — a failed refresh should never
      // blank out previously loaded transfers.
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
        // Status + current_step + approvals all shift server-side, so pull
        // fresh rather than patching locally.
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