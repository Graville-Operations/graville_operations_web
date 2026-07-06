
export interface ApiEnvelope<T = unknown> {
  code: number;
  data: T | null;
  message: string;
}

export function unwrapApiResponse<T>(res: { data: ApiEnvelope<T> }): T {
  const body = res.data;
  if (!body?.data) {
    throw new Error(body?.message || 'Something went wrong. Please try again.');
  }
  return body.data;
}