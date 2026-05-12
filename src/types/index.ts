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

export interface LoginResponse {
  access_token: string;
  token_type: string;
  session_id: string;
  account_type: string;
  expires_in: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  lpo_number: string;
  delivery_number: string;
  supplier_name: string;
  invoice_date: string;
  total_amount: number;
  amount_paid: number;
  status: string;
  site?: string;
  items?: InvoiceItem[];
  submitted_by?: string;
  submitted_by_id: number;
  notes?: string;
  created_at: string;
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
  link?: string;
  icon?: string;
  priority: number;
  sub_menus: SubMenu[];
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string;
  icon?: string;
  priority: number;
}