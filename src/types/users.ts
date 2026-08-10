import type { DepartmentBrief } from '@/types/department';

export interface User {
  id?: number;
  ref_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  phone_no?: string;
  national_id?: string;
  staff_id?: string;
  enabled?: boolean;
  expires_at?: string;
  is_active?: boolean;
}

export interface ApiUser {
  id: number;
  ref_id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  nationalId?: string;
  accountStatus?: string;
  role?: string;
  is_active?: boolean;
}

export type Department = DepartmentBrief;

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  createdAt?: string;
}

export interface UserDetail extends ApiUser {
  departments?: Department[];
}

export interface NewUserFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role_id: string | number;
  department_id: string | number;
  site_ids: number[] | null;
}

export interface RoleFormState {
  name: string;
  description: string;
}