// lib/errors.ts
import axios from 'axios';

export function getLoginErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // True network-level failures (CORS, timeout, server down) still throw normally
    if (!err.response) return 'Network error. Check your internet connection.';
    const data = err.response.data;
    if (typeof data?.message === 'string') return data.message;
    return `Login failed (${err.response.status}).`;
  }

  if (err instanceof Error) return err.message; // now carries the real backend message

  return 'Login failed';
}