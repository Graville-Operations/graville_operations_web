'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { InvoiceListItem, Invoice } from '@/types';
import { Search, Eye, Plus, X, Receipt } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices]   = useState<InvoiceListItem[]>([]);
  const [filtered, setFiltered]   = useState<InvoiceListItem[]>([]);
  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected]   = useState<Invoice | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      invoices.filter((i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        i.supplier_name.toLowerCase().includes(q) ||
        i.invoice_date.toLowerCase().includes(q)
      )
    );
  }, [search, invoices]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/invoices/all');
      setInvoices(data);
      setFiltered(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const { data } = await api.get(`/invoices/details/${id}`);
      setSelected(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>
            Invoices
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--gv-text-muted)' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/finance/invoices/new"
          className="gv-btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="gv-card !p-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--gv-text-subtle)' }}
          />
          <input
            type="text"
            placeholder="Search by invoice no, supplier, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gv-input !pl-9 !py-2 text-sm"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="gv-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Receipt size={40} style={{ color: 'var(--gv-text-faint)' }} className="mb-3" />
            <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
              {search ? `No results for "${search}"` : 'No invoices found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                  {['Invoice No', 'Supplier', 'Invoice Date', 'Total Value', 'Submitted On', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#33907c' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: idx < filtered.length - 1
                        ? '1px solid var(--gv-glass-border)'
                        : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 text-sm font-semibold"
                        style={{ color: 'var(--gv-text-primary)' }}>
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-sm"
                        style={{ color: 'var(--gv-text-muted)' }}>
                      {inv.supplier_name}
                    </td>
                    <td className="px-4 py-3 text-sm"
                        style={{ color: 'var(--gv-text-muted)' }}>
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium"
                        style={{ color: 'var(--gv-text-primary)' }}>
                      KES {inv.total_invoice_value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm"
                        style={{ color: 'var(--gv-text-muted)' }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => fetchDetail(inv.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#33907c' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(51,144,124,0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {(selected || detailLoading) && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--gv-glass-border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="gv-icon-box">
                  <Receipt size={18} className="text-[#33907c]" />
                </div>
                <h3 className="font-bold text-base" style={{ color: 'var(--gv-text-primary)' }}>
                  {selected ? `Invoice #${selected.invoice_number}` : 'Loading...'}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--gv-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gv-glass-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-[#33907c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selected ? (
              <div className="p-6 space-y-6">

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Supplier',         value: selected.supplier_name },
                    { label: 'LPO Number',        value: selected.lpo_number ?? '—' },
                    { label: 'Delivery Number',   value: selected.delivery_number ?? '—' },
                    { label: 'Invoice Date',      value: new Date(selected.invoice_date).toLocaleDateString() },
                    { label: 'Site ID',           value: String(selected.site_id) },
                    { label: 'Submitted On',      value: new Date(selected.created_at).toLocaleDateString() },
                    { label: 'Notes',             value: selected.notes ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="gv-eyebrow mb-1">{label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--gv-text-primary)' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Items Table */}
                {selected.items && selected.items.length > 0 && (
                  <div>
                    <p className="gv-eyebrow mb-3">Items</p>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid var(--gv-glass-border)' }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: 'rgba(51,144,124,0.08)' }}>
                            {['#', 'Particulars', 'Qty', 'Unit Price', 'Total'].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: '#33907c' }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.items.map((item) => (
                            <tr
                              key={item.id}
                              style={{ borderTop: '1px solid var(--gv-glass-border)' }}
                            >
                              <td className="px-4 py-2.5 text-xs"
                                  style={{ color: 'var(--gv-text-subtle)' }}>
                                {item.item_index}
                              </td>
                              <td className="px-4 py-2.5"
                                  style={{ color: 'var(--gv-text-primary)' }}>
                                {item.particulars}
                              </td>
                              <td className="px-4 py-2.5"
                                  style={{ color: 'var(--gv-text-muted)' }}>
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2.5"
                                  style={{ color: 'var(--gv-text-muted)' }}>
                                KES {item.unit_price.toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 font-semibold"
                                  style={{ color: '#33907c' }}>
                                KES {item.total_price.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div
                  className="flex items-center justify-between rounded-xl px-5 py-4"
                  style={{ background: 'rgba(51,144,124,0.10)', border: '1px solid rgba(51,144,124,0.25)' }}
                >
                  <span className="text-sm font-medium"
                        style={{ color: 'var(--gv-text-muted)' }}>
                    Total Invoice Value
                  </span>
                  <span className="text-xl font-bold" style={{ color: '#33907c' }}>
                    KES {selected.total_invoice_value.toLocaleString()}
                  </span>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}