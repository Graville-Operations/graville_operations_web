import axios from 'axios';

export function getLoginErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Network error. Check your internet connection.';
    const data = err.response.data;
    if (typeof data?.message === 'string') return data.message;
    return fallback;
  }

  if (err instanceof Error) return err.message;

  return fallback;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Network error. Check your internet connection.';
    const data = err.response.data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.detail === 'string') return data.detail;
    return fallback;
  }

  if (err instanceof Error) return err.message;

  return fallback;
}