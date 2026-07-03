// lib/api-response.ts
export interface ApiEnvelope<T = unknown> {
  code: number;
  data: T | null;
  message: string;
}

/**
 * Unwraps your backend's envelope response.
 * Your backend ALWAYS returns HTTP 200, even on failure,
 * so success/failure is determined by `data` being non-null.
 */
export function unwrapApiResponse<T>(res: { data: ApiEnvelope<T> }): T {
  const body = res.data;
  if (!body?.data) {
    throw new Error(body?.message || 'Something went wrong. Please try again.');
  }
  return body.data;
}