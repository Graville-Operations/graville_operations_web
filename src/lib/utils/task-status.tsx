import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TaskStatusConfig {
  label: string;
  icon: ReactNode;
  className: string;
}

export const STATUS_CONFIG: Record<string, TaskStatusConfig> = {
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 size={12} />,
    className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: <AlertCircle size={12} />,
    className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  pending: {
    label: 'Pending',
    icon: <Clock size={12} />,
    className: 'bg-white/5 text-[var(--gv-text-muted)] border border-[var(--gv-glass-border)]',
  },
};

export function normalizeStatus(status?: string): string {
  return (status ?? '').toLowerCase().trim().replace(/\s+/g, '_');
}

export function getTaskStatusConfig(status?: string): TaskStatusConfig {
  return STATUS_CONFIG[normalizeStatus(status)] ?? STATUS_CONFIG.pending;
}

export const ACCENT_COLORS = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-500 to-purple-500',
];

export function getAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}