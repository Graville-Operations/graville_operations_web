'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useUsers } from '@/hooks/users/useUsers';
import { getApiErrorMessage } from '@/lib/api/api-error';
import {
  fetchTransferDetail,
  actionTransfer,
  assignTransferTransport,
  submitTransfer,
} from '@/lib/api/transfers';
import { modesOfTransportService } from '@/lib/api/transport-service';
import { resolveCanApprove } from '@/lib/utils/transfer-approval';
import { formatVehicleLabel } from '@/lib/utils/transfer-format';
import { getTransferRow, patchTransferRow } from '@/lib/transfers-cache';
import { TransferDetail, TransferApprovalStatus, TransferStatus, TransferRow } from '@/types/transfer';
import type { ModeOfTransport } from '@/types/transport';

export function useTransferDetail(id: number) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { users } = useUsers();
  const preview: TransferRow | undefined = useMemo(() => getTransferRow(id), [id]);

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
  const canApprove = transfer
    ? resolveCanApprove(transfer.approvals, transfer.currentStep, userId, transfer.status)
    : preview?.canApprove ?? false;

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
  const vehicleLabel = transfer ? formatVehicleLabel(transfer.transport) : '';

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
        patchTransferRow(id, { status: updated.status, currentStep: updated.currentStep });
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
  const isOwnDraft = !!transfer && transfer.status === TransferStatus.DRAFT && transfer.requestedBy === userId;

  const [transportOptions, setTransportOptions] = useState<ModeOfTransport[]>([]);
  const [isLoadingTransports, setIsLoadingTransports] = useState(false);
  const [isAssigningTransport, setIsAssigningTransport] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwnDraft) return;
    let cancelled = false;
    setIsLoadingTransports(true);
    modesOfTransportService
      .list()
      .then((list) => {
        if (!cancelled) setTransportOptions(list.filter((t) => t.is_active));
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTransports(false);
      });
    return () => { cancelled = true; };
  }, [isOwnDraft]);

  const assignTransport = useCallback(
    async (transportId: number) => {
      setEditError(null);
      setIsAssigningTransport(true);
      try {
        const updated = await assignTransferTransport(id, transportId);
        setTransfer(updated);
        patchTransferRow(id, { vehicleLabel: formatVehicleLabel(updated.transport) });
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to assign vehicle.');
        setEditError(message);
        throw new Error(message);
      } finally {
        setIsAssigningTransport(false);
      }
    },
    [id],
  );

  const submitDraft = useCallback(async () => {
    setEditError(null);
    setIsSubmittingDraft(true);
    try {
      const updated = await submitTransfer(id);
      setTransfer(updated);
      patchTransferRow(id, { status: updated.status });
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to submit transfer.');
      setEditError(message);
      throw new Error(message);
    } finally {
      setIsSubmittingDraft(false);
    }
  }, [id]);

  return {
    transfer,
    preview,
    vehicleLabel,
    isLoading,
    loadError,
    canApprove,
    driver,
    isActioning,
    actionError,
    setActionError,
    act,
    isOwnDraft,
    transportOptions,
    isLoadingTransports,
    isAssigningTransport,
    isSubmittingDraft,
    editError,
    setEditError,
    assignTransport,
    submitDraft,
    refresh: () => load({ silent: true }),
  };
}