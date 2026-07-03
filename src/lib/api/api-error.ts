/** Pulls a readable message out of an Axios error, with a fallback. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { status?: number; data?: { detail?: unknown; message?: unknown } } };
  const detail = e.response?.data?.detail ?? e.response?.data?.message;

  if (typeof detail === 'string') return detail;
  if (detail !== undefined) return JSON.stringify(detail);
  if (e.response?.status) return `${fallback} (${e.response.status})`;
  return fallback;
}