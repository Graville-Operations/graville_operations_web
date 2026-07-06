export interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface DeptDetail {
  id: number;
  name: string;
  description?: string;
}

export type ToastState = { message: string; type: 'success' | 'error' } | null;

export type AssignResult = { ok: true } | { ok: false; message: string };