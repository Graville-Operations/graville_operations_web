export interface CreatedBy {
  name: string;
  email: string;
  phone: string;
}

export interface InvoiceItem {
  id: number;
  index: number;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalMaterialPrice: number;
}

export interface Invoice {
  id: number;

  // support BOTH backend styles safely
  invoice_no?: string;
  invoiceNo?: string;

  delivery_no?: string;
  deliveryNo?: string;

  lpo_no?: string;
  lpoNo?: string;

  supplier_name?: string;
  supplierName?: string;

  invoice_date?: string;
  invoiceDate?: string;

  notes: string;

  created_by?: CreatedBy;
  createdBy?: CreatedBy;

  total: number;
  created_at: string;

  items: InvoiceItem[];
}

export interface InvoiceResponse {
  code: number;
  data: {
    items: Invoice[];
    total: number;
    skip: number;
    limit: number;
  };
  message: string;
}