import { ModeOfTransport } from '@/types/transport';

const previewKey = (id: number | string) => `motransport_preview_${id}`;

/** Stashes the row data already on-screen so the detail page can render instantly on navigation. */
export function cacheTransportPreview(t: ModeOfTransport): void {
  try {
    sessionStorage.setItem(previewKey(t.id), JSON.stringify(t));
  } catch {
    /* sessionStorage unavailable — detail page will just show its own skeleton */
  }
}

export function readTransportPreview(id: number | string): ModeOfTransport | null {
  try {
    const raw = sessionStorage.getItem(previewKey(id));
    return raw ? (JSON.parse(raw) as ModeOfTransport) : null;
  } catch {
    return null;
  }
}

export function clearTransportPreview(id: number | string): void {
  try {
    sessionStorage.removeItem(previewKey(id));
  } catch {
    /* ignore */
  }
}