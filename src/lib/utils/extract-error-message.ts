export function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string; message?: string } }; message?: string };
  return e?.response?.data?.detail ?? e?.response?.data?.message ?? e?.message ?? fallback;
}