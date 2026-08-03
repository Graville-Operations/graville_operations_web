import { CheckCircle2, Clock, FileEdit } from 'lucide-react';
import type { UsageLogStatus } from '@/types/store';

export function statusOrder(
  status: UsageLogStatus | string | undefined,
  iconSize = 10,
): { label: string; color: string; icon: React.ReactNode } {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return { label: 'Submitted', color: 'var(--primary)', icon: <CheckCircle2 size={iconSize} /> };
    case 'approved':
      return { label: 'Approved', color: '#22c55e', icon: <CheckCircle2 size={iconSize} /> };
    case 'pending_edit':
      return { label: 'Edit Pending', color: '#f59e0b', icon: <FileEdit size={iconSize} /> };
    default:
      return { label: 'Draft', color: 'var(--muted-foreground)', icon: <Clock size={iconSize} /> };
      
  }
}