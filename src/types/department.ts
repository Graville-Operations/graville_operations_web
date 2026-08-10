export interface RawDepartment {
  id: number;
  name: string;
  description?: string;
  menus: number;
  users: number;
}

export interface DepartmentBrief {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  menusCount: number;
  usersCount: number;
}

export interface CreateDepartmentPayload {
  name: string;
  description: string;
}

export type ToastState = { message: string; type: 'success' | 'error' } | null;