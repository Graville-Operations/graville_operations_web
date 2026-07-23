export interface InvoiceSummaryItem {
  id: string;
  name: string;
  pendingAmount: number;
  totalPendingInvoices: number;
  paidAmount: number;
  totalPaidInvoices: number;
}