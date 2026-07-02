import { ApiUser } from '@/types';

export interface Department {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface UserDetail extends ApiUser {
  departments?: Department[];
}

export interface NewUserFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  password: string;
  role_id: string | number;
  department_id: string | number;
  site_ids: number[] | null;
}
export interface Role {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  createdAt?: string;
}

export interface RoleFormState {
  name: string;
  description: string;
}