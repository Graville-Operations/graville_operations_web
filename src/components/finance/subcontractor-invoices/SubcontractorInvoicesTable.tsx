'use client';

import { Receipt, ChevronDown } from 'lucide-react';
import type { SubcontractorInvoiceListItem } from '@/types/subcontractor-invoice';
import { formatKes } from '@/lib/utils/currency';

interface SubcontractorInvoicesTableProps {
  invoices: SubcontractorInvoiceListItem[];
  isLoading: boolean;
  onSelect: (id: number) => void;
}

export function SubcontractorInvoicesTable({
  invoices,
  isLoading,
  onSelect,
}: SubcontractorInvoicesTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/40">
        <Receipt size={48} className="mb-3 opacity-30" />
        <p className="text-sm">No subcontractor invoices found</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-white/5 border-b border-white/10">
        <tr>
          {['Invoice No', 'Subcontractor Name', 'Invoice Date', 'Amount (KShs)', 'Submitted By', ''].map(
            (h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
              >
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {invoices.map((inv) => (
          <tr
            key={inv.id}
            onClick={() => onSelect(inv.id)}
            className="cursor-pointer hover:bg-white/5 transition-colors"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#33907C]/20 rounded-lg flex items-center justify-center shrink-0">
                  <Receipt size={14} className="text-[#33907C]" />
                </div>
                <span className="text-sm font-medium text-white">{inv.invoiceNo}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-white/60">{inv.contractorName}</td>
            <td className="px-6 py-4 text-sm text-white/60">{inv.invoiceDate}</td>
            <td className="px-6 py-4">
              <span className="text-sm font-semibold text-[#33907C]">KES {formatKes(inv.total)}</span>
            </td>
            <td className="px-6 py-4">
              {inv.createdBy ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#33907C]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#33907C] font-bold text-xs">
                      {inv.createdBy.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white/60">{inv.createdBy.name}</span>
                </div>
              ) : (
                <span className="text-sm text-white/30">—</span>
              )}
            </td>
            <td className="px-6 py-4">
              <ChevronDown size={16} className="text-white/30 -rotate-90" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}