
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { status?: number; data?: { detail?: unknown; message?: unknown } } };
  const detail = e.response?.data?.detail ?? e.response?.data?.message;

  if (typeof detail === 'string') return detail;
  if (detail !== undefined) return JSON.stringify(detail);
  if (e.response?.status) return `${fallback} (${e.response.status})`;
  // No HTTP response: either the api client's own Error (the server answered 200 with an
  // error `code`/`message` in the body) or a network failure. Show its message.
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}