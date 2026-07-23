// src/types/invoice-summary.ts
export interface InvoiceSummaryItem {
  id: string;
  name: string;
  pendingAmount: number;
  pendingCount: number;
  partiallyPaidInvoiceTotal: number;
  partiallyPaidAmountPaid: number;
  partiallyPaidBalanceDue: number;
  partiallyPaidCount: number;
  paidAmount: number;
  paidCount: number;
  rejectedAmount: number;
  rejectedCount: number;
  totalInvoiceCount: number;
  totalAmountPaid: number;
  totalRemainingBalance: number;
}