<<<<<<< HEAD
export default function UserReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">User Reports</h2>
        <p className="text-sm text-gray-500">View and export user reports</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center text-gray-400">
        Coming soon
=======
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Receipt, Search, Eye } from 'lucide-react';

interface ClientInvoice {
  id: number;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  total_invoice_value: number;
  site_id: number;
  notes?: string;
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [filtered, setFiltered] = useState<ClientInvoice[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/client-invoices/all?limit=20');
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setInvoices(list);
      setFiltered(list);
      setTotal(payload?.total ?? list.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      setFiltered(
        invoices.filter(
          (inv) =>
            inv.invoice_number.toLowerCase().includes(q) ||
            inv.client_name.toLowerCase().includes(q)
        )
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [search, invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Client Invoices</h2>
          <p className="text-sm text-blue-200/60">{total} total invoices</p>
        </div>
        <Link
          href="/finance/invoice/client/new"
          className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/40">
            <Receipt size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No client invoices yet</p>
            <Link
              href="/finance/invoices/client/new"
              className="mt-3 text-xs text-[#33907C] hover:underline"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['Invoice #', 'Client', 'Date', 'Amount', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#33907C]/20 rounded-lg flex items-center justify-center shrink-0">
                        <Receipt size={14} className="text-[#33907C]" />
                      </div>
                      <span className="text-sm font-medium text-white">{inv.invoice_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{inv.client_name}</td>
                  <td className="px-6 py-4 text-sm text-white/60">
                    {new Date(inv.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#33907C]">
                      KES {inv.total_invoice_value?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/finance/invoices/client/${inv.id}`}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
>>>>>>> ff333752c2f6b4a16f9c4ff7ccd632a076af112e
      </div>
    </div>
  );
}