/**
 * Formats an ISO date string from the backend into a readable date.
 * Handles: "2026-05-20T16:12:56.424145+03:00", "2026-05-20", etc.
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-KE', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}
export const parseBackendDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const todayISO = (): string => new Date().toISOString().split('T')[0];