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
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  session_id?: string;
  account_type?: string;
  role?: string;
  expires_at: string;
  user_id: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  lpo_number?: string;
  delivery_number?: string;
  supplier_name: string;
  invoice_date: string;
  total_amount?: number;
  total_invoice_value?: number;
  amount_paid?: number;
  status?: string;
  site?: string;
  items?: InvoiceItem[];
  submitted_by?: string;
  submitted_by_id?: number;
  notes?: string;
  created_at?: string;
}

export interface InvoiceItem {
  particular: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
  submenus: SubMenu[];
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
  subsubmenus?: SubSubMenu[];
}

export interface SubSubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
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
}
export interface ClientInvoiceItem {
  id: number;
  item_index: number;
  particulars: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ClientInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  total_invoice_value: number;
  notes?: string;
  site_id: number;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  items: ClientInvoiceItem[];
}

export interface ClientInvoiceListItem {
  id: number;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  total_invoice_value: number;
  site_id: number;
  created_at: string;
}

export interface Site {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}