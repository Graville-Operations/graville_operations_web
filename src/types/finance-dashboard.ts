import { Site } from '@/types/site';

export type DashboardSite = Pick<Site, 'id' | 'name'>;

export interface InvoiceStatRow {
  total: number;
}

export interface InvoiceStat {
  count:  number;
  amount: number;
}

export type InvoiceTypeKey = 'client' | 'supplier' | 'subcontractor';

export interface InvoiceTypeStat {
  key:    InvoiceTypeKey;
  label:  string;
  count:  number;
  amount: number;
  route:  string;
}

export interface SiteStat {
  site:        DashboardSite;
  rows:        InvoiceTypeStat[];
  companyStat: InvoiceStat | null;
  loading:     boolean;
  error:       boolean;
}