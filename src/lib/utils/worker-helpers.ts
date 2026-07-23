import type { Worker } from '@/lib/types';

export function getWorkerName(worker: Worker): string {
  const w = worker as unknown as { name?: string; first_name?: string; last_name?: string };
  if (w.name) return w.name;
  const full = `${w.first_name ?? ''} ${w.last_name ?? ''}`.trim();
  return full || 'Unnamed worker';
}

export function getWorkerSubtitle(worker: Worker): string | null {
  const w = worker as unknown as { role?: string; department?: string; skill?: { name?: string } };
  const parts = [w.role, w.department].filter(Boolean) as string[];
  if (parts.length) return parts.join(' · ');
  return w.skill?.name ?? null;
}