import type { SiteWorker } from '@/types/site';

export function getWorkerName(worker: SiteWorker): string {
  const full = `${worker.first_name ?? ''} ${worker.last_name ?? ''}`.trim();
  return full || 'Unnamed worker';
}
export function getWorkerSubtitle(worker: SiteWorker): string | null {
  return worker.skill?.name ?? null;
}