
export function formatDisplayDate(value?: string | null): string {
  return value?.trim() ? value : '—';
}