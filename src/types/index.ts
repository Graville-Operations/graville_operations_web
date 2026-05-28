export interface User {
  id: number;
  ref_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  phone_no?: string;
  national_id?: string;
  staff_id?: string;
  enabled: boolean;
}

export interface ApiUser {
  ref_id: string;
  id?: number;       
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  nationalId?: string;
  accountStatus?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  session_id: string;
  account_type: string;
  expires_at: string;
}

export interface Material {
  id: number;
  name: string;
  unit?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  title: string;
  link?: string;
  icon?: string;
  order: number;
  submenus: SubMenu[];
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string;
  icon?: string;
  order: number;
  subsubmenus?: SubSubMenu[];
}

export interface SubSubMenu {
  id: number;
  name: string;
  title: string;
  link?: string;
  icon?: string;
  order: number;
}

