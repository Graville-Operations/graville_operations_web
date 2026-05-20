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
  token: string;           // was access_token
  token_type: string;
  session_id: string;
  account_type: string;
  expires_at: string;      // was expires_in
}

export interface InvoiceItem {
  id: number;
  item_index: number;
  material_id: number;
  particulars: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  lpo_number?: string;
  delivery_number?: string;
  invoice_date: string;
  supplier_name: string;
  total_invoice_value: number;
  notes?: string;
  site_id: number;
  store_id: number;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  items: InvoiceItem[];
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  supplier_name: string;
  invoice_date: string;
  total_invoice_value: number;
  site_id: number;
  created_at: string;
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
  order: number;           // was priority
  submenus: SubMenu[];     // was sub_menus
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string;
  icon?: string;
  order: number;           // was priority
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