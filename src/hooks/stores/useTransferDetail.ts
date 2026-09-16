'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useUsers } from '@/hooks/users/useUsers';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { fetchTransferDetail, actionTransfer } from '@/lib/api/transfers';
import { resolveCanApprove } from '@/lib/utils/transfer-approval';
import { TransferDetail, TransferApprovalStatus } from '@/types/transfer';

export function useTransferDetail(id: number) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { users } = useUsers();

  const [transfer, setTransfer] = useState<TransferDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!Number.isFinite(id)) return;
    if (!opts?.silent) setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await fetchTransferDetail(id);
      setTransfer(detail);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load transfer.'));
    } finally {
      if (!opts?.silent) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Only the current approval step's status matters for whether Approve/
  // Reject should show — the overall transfer.status (DRAFT/IN_TRANSIT/etc.)
  // is a separate, wider lifecycle field.
  const canApprove = transfer
    ? resolveCanApprove(transfer.approvals, transfer.currentStep, userId)
    : false;

  const resolveUserName = useCallback(
    (id: number | null | undefined) => {
      if (!id) return null;
      const match = users.find((u) => u.id === id);
      return match ? `${match.firstName} ${match.lastName}`.trim() : null;
    },
    [users],
  );

  const driver = useMemo(() => {
    const driverId = transfer?.transport?.driverId;
    if (!driverId) return null;
    const match = users.find((u) => u.id === driverId);
    if (!match) return null;
    return {
      name: `${match.firstName} ${match.lastName}`.trim(),
      phone: match.phone ?? null,
    };
  }, [transfer, users]);

  const act = useCallback(
    async (
      status: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED,
      comment?: string,
    ) => {
      setActionError(null);
      setIsActioning(true);
      try {
        const updated = await actionTransfer(id, { status, comment: comment || null });
        setTransfer(updated);
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to action transfer.');
        setActionError(message);
        throw new Error(message);
      } finally {
        setIsActioning(false);
      }
    },
    [id],
  );

  return {
    transfer,
    isLoading,
    loadError,
    canApprove,
    driver,
    requestedByName: resolveUserName(transfer?.requestedBy),
    isActioning,
    actionError,
    setActionError,
    act,
    refresh: () => load({ silent: true }),
  };
}