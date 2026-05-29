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

// ── Raw shapes — exactly as the backend returns them ──────────────────────────

export interface RawInvoiceItem {
  id: number;
  index: number;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalMaterialPrice: number;
}

export interface RawCreatedBy {
  name: string;
  email: string;
  phone: string;
}

export interface RawInvoice {
  id: number;
  invoiceNo: string;
  deliveryNo: string | null;
  lpoNo: string | null;
  supplierName: string;
  invoiceDate: string;
  notes: string | null;
  createdBy: RawCreatedBy | null;
  total: number;
  amountPaid: number;
  status: string;
  site: string | null;
  created_at: string;
  items: RawInvoiceItem[];
}

export interface RawPaginatedResponse<T> {
  code: number;
  data: {
    items: T[];
    total: number;
    skip: number;
    limit: number;
  };
  message: string;
}

// ── Normalised shapes the frontend uses ──────────────────────────────────────

export interface InvoiceItem {
  id: number;
  index: number;
  particular: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  lpo_number: string | null;
  delivery_number: string | null;
  supplier_name: string;
  invoice_date: string;
  total_amount: number;
  amount_paid: number;
  status: string;
  site: string | null;
  items: InvoiceItem[];
  submitted_by: string | null;
  submitted_by_id: number;
  notes: string | null;
  created_at: string;
}

export interface Material {
  id: number;
  name: string;
  unit?: string;
}

// ── Transformer ───────────────────────────────────────────────────────────────

export function normaliseInvoice(raw: RawInvoice): Invoice {
  return {
    id:              raw.id,
    invoice_number:  raw.invoiceNo,
    lpo_number:      raw.lpoNo      ?? null,
    delivery_number: raw.deliveryNo ?? null,
    supplier_name:   raw.supplierName,
    invoice_date:    raw.invoiceDate,
    total_amount:    raw.total,
    amount_paid:     raw.amountPaid  ?? 0,
    status:          raw.status      ?? 'PENDING',
    site:            raw.site        ?? null,
    submitted_by:    raw.createdBy?.name ?? null,
    submitted_by_id: 0,
    notes:           raw.notes ?? null,
    created_at:      raw.created_at,
    items: (raw.items ?? []).map((item) => ({
      id:          item.id,
      index:       item.index,
      particular:  item.materialName,
      quantity:    item.quantity,
      unit_price:  item.unitPrice,
      total_price: item.totalMaterialPrice,
    })),
  };
}

// ── Menu types ────────────────────────────────────────────────────────────────

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

// ── Company types ─────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  email: string;
  logo?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface CompanyFormData {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  description: string;
  website: string;
}

export interface CompanyCreatePayload {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
  description?: string;
  website?: string;
}

export type FormErrors = Partial<Record<keyof CompanyFormData, string>>;