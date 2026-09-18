import { TransferApproval, TransferApprovalStatus, TransferStatus, ACTIONABLE_STATUSES } from '@/types/transfer';

export function resolveCanApprove(
  approvals: TransferApproval[],
  currentStep: number,
  userId: number | undefined,
  transferStatus?: TransferStatus,
): boolean {
  if (!userId) return false;
  if (transferStatus && !ACTIONABLE_STATUSES.includes(transferStatus)) return false;
  const current = approvals.find((a) => a.stepOrder === currentStep);
  if (!current) return false;
  return current.approverId === userId && current.status === TransferApprovalStatus.PENDING;
}