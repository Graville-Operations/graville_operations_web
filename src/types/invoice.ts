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
  created_at: string;   
  requester: string | null;
  source: string | null;
  updatedAt: string | null;
  total: number;
  amountPaid: number;
  status: string;
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
  created_at: string | null;  
}

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
    site:            raw.source      ?? null,  
    submitted_by:    raw.requester   ?? raw.createdBy?.name ?? null,
    submitted_by_id: 0,
    notes:           raw.notes       ?? null,
    created_at:      raw.created_at  ?? raw.updatedAt ?? null, 
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