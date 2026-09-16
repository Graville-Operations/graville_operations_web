import { TransferApproval, TransferApprovalStatus } from '@/types/transfer';
export function resolveCanApprove(
  approvals: TransferApproval[],
  currentStep: number,
  userId: number | undefined,
): boolean {
  if (!userId) return false;
  const current = approvals.find((a) => a.stepOrder === currentStep);
  if (!current) return false;
  return current.approverId === userId && current.status === TransferApprovalStatus.PENDING;
}