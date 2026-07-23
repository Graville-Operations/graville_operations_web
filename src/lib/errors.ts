import axios from 'axios';

// Shared detector — a network error means the request never got a response
// at all (DNS failure, dropped connection, timeout, CORS block, server
// unreachable). Distinct from a 4xx/5xx, where the backend did respond.
export function isNetworkError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
  }
  if (err instanceof Error) {
    return err.message === 'Network Error';
  }
  return false;
}

export function getLoginErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Network error. Check your internet connection.';
    const data = err.response.data;
    if (typeof data?.message === 'string') return data.message;
    return `Login failed (${err.response.status}).`;
  }

  if (err instanceof Error) return err.message; 

  return 'Login failed';
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Network error. Check your internet connection.';
    const data = err.response.data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.detail === 'string') return data.detail;
    return `${fallback} (${err.response.status}).`;
  }

  if (err instanceof Error) return err.message;

  return fallback;
}