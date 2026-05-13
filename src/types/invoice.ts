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
  invoiceNo: string;
  deliveryNo: string;
  lpoNo: string;
  supplierName: string;
  invoiceDate: string;
  notes: string;
  createdBy: CreatedBy;
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