// src/lib/invoice-summary-config.ts
import { Briefcase, Landmark, Receipt, FileText, LucideIcon } from 'lucide-react';

interface InvoiceSummaryConfigEntry {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const INVOICE_SUMMARY_CONFIG: Record<string, InvoiceSummaryConfigEntry> = {
  'supplier-invoice': {
    label: 'Supplier Invoices',
    icon: Briefcase,
    iconBg: 'rgba(251,146,60,0.20)',
    iconColor: '#fb923c',
  },
  'company-invoice': {
    label: 'Company Invoices',
    icon: Landmark,
    iconBg: 'rgba(96,165,250,0.20)',
    iconColor: '#60a5fa',
  },
  'client-invoice': {
    label: 'Client Invoices',
    icon: Receipt,
    iconBg: 'rgba(51,144,124,0.20)',
    iconColor: '#33907c',
  },
  'subcontractor-invoice': {
    label: 'Subcontractor Invoices',
    icon: FileText,
    iconBg: 'rgba(167,139,250,0.20)',
    iconColor: '#a78bfa',
  },
};

export const INVOICE_SUMMARY_ORDER = [
  'supplier-invoice',
  'company-invoice',
  'client-invoice',
  'subcontractor-invoice',
];