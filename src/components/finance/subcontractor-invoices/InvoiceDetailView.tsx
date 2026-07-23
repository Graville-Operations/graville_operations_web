'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, StickyNote, Download, Loader2, History, DollarSign, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSubcontractorInvoiceDetail } from '@/hooks/subcontractor-invoices/useSubcontractorInvoiceDetail';
import { formatKes } from '@/lib/utils/currency';
import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';
import {
  updateSubcontractorInvoiceStatus,
  recordSubcontractorInvoicePayment,
  fetchSubcontractorInvoicePaymentHistory,
} from '@/lib/api/subcontractor-invoices';
import type { SubcontractorInvoiceListItem } from '@/types/subcontractor-invoice';
import { Field } from './Field';
import { StatusBadge } from './StatusBadge';
import { PaymentHistoryView } from './PaymentHistoryView';

interface InvoiceDetailViewProps {
  invoiceId: number;
  initialData?: SubcontractorInvoiceListItem;
  onBack: () => void;
}

function ShimmerLine({ w, h }: { w: string; h: string }) {
  return <div className="rounded animate-pulse bg-white/10" style={{ width: w, height: h }} />;
}

function ModalShell({
  onClose,
  widthClass = 'max-w-sm',
  children,
}: {
  onClose: () => void;
  widthClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} space-y-4 rounded-2xl p-5`}
        style={{ background: '#0d1528', border: '1px solid var(--gv-glass-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function InvoiceDetailView({ invoiceId, initialData, onBack }: InvoiceDetailViewProps) {
  const { invoice, detailLoading, hasFullDetail, error, retry } =
    useSubcontractorInvoiceDetail(invoiceId, initialData);
  const [downloading, setDownloading] = useState(false);

  // Status / payment action state
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paidSummary, setPaidSummary] = useState<{ totalPaid: number; remainingBalance: number } | null>(null);
  const [paidSummaryLoading, setPaidSummaryLoading] = useState(false);

  const status = invoice?.paymentStatus;
  const isPending = !status || status === 'PENDING';
  const isPartiallyPaid = status === 'PARTIALLY_PAID';
  const isPaid = status === 'PAID';
  const canReject = isPending;
  const canRecordPayment = isPending || isPartiallyPaid;
  const canViewHistory = isPartiallyPaid || isPaid;

  useEffect(() => {
    if (!invoice || !isPartiallyPaid) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaidSummaryLoading(true);
    fetchSubcontractorInvoicePaymentHistory(invoice.id)
      .then((data) => {
        if (!cancelled) {
          setPaidSummary({ totalPaid: data.totalPaid, remainingBalance: data.remainingBalance });
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => console.error(err))
      .finally(() => {
        if (!cancelled) setPaidSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id, isPartiallyPaid]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRejectModal) setShowRejectModal(false);
        else if (showPaymentModal) setShowPaymentModal(false);
        else if (!showHistoryPage) onBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack, showRejectModal, showPaymentModal, showHistoryPage]);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await generateInvoicePDF({
        invoiceNo:   invoice.invoiceNo,
        invoiceType: 'Contractor',
        clientName:  invoice.contractorName,
        invoiceDate: invoice.invoiceDate,
        notes:       invoice.notes ?? undefined,
        createdBy:   invoice.createdBy?.name ?? '—',
        createdAt:   invoice.created_at,
        total:       invoice.total,
        items:       invoice.items,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!invoice) return;
    setRejecting(true);
    setRejectError(null);
    try {
      await updateSubcontractorInvoiceStatus(invoice.id, 'REJECTED');
      setShowRejectModal(false);
      await retry();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const statusCode = err?.response?.status ?? err?.status;
      if (statusCode === 403 || statusCode === 401) {
        setRejectError("You don't have permission to reject this invoice — only the invoice creator or an admin can do that.");
      } else {
        setRejectError('Failed to reject invoice. Please try again.');
      }
    } finally {
      setRejecting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError('Enter a valid amount.');
      return;
    }
    setSubmittingPayment(true);
    setPaymentError(null);
    try {
      await recordSubcontractorInvoicePayment(invoice.id, {
        amount,
        notes: paymentNotes || undefined,
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentNotes('');
      await retry();
    } catch (err) {
      console.error(err);
      setPaymentError('Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (invoice && showHistoryPage) {
    return (
      <PaymentHistoryView
        invoiceId={invoice.id}
        invoiceTotal={invoice.total}
        onBack={() => setShowHistoryPage(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <ChevronLeft size={16} />
        </div>
        <span>Back to Invoices</span>
      </button>

      {invoice && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Invoice {invoice.invoiceNo}</h2>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-white/40">{invoice.contractorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {canViewHistory && (
              <button
                onClick={() => setShowHistoryPage(true)}
                disabled={!hasFullDetail}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20
                           text-white/80 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <History size={14} />
                Payment History
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading || !hasFullDetail}
              className="flex items-center gap-2 bg-[#33907C]/15 hover:bg-[#33907C]/25 border border-[#33907C]/35
                         text-[#33907C] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {!invoice && detailLoading && (
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !invoice && (
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={retry}
            className="text-xs bg-white/10 border border-white/20 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors text-white/70"
          >
            Retry
          </button>
        </div>
      )}

      {invoice && (
        <>
          <div className="gv-card space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 pb-3 border-b border-white/10 mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-5">
                <Field label="Invoice No.">{invoice.invoiceNo}</Field>
                <Field label="Invoice Date">{invoice.invoiceDate}</Field>
                <Field label="Contractor">{invoice.contractorName}</Field>
                <Field label="Total (KES)">
                  <span className="text-[#33907C] font-bold">{formatKes(invoice.total)}</span>
                </Field>
                <Field label="Created At">{invoice.created_at}</Field>
              </div>
            </div>

            <div className="gv-divider" />

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
                Submitted By
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#33907C]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#33907C] font-bold text-lg">
                    {invoice.createdBy.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-white">{invoice.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Email
                    </p>
                    <p className="text-sm text-blue-400">{invoice.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm text-white/60">{invoice.createdBy.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isPartiallyPaid && (
            <div className="gv-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 pb-3 border-b border-white/10 mb-4">
                Payment Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
                <Field label="Total (KES)">
                  <span className="text-white font-semibold">{formatKes(invoice.total)}</span>
                </Field>
                <Field label="Amount Paid (KES)">
                  {paidSummaryLoading ? (
                    <ShimmerLine w="80px" h="14px" />
                  ) : (
                    <span className="text-[#33907C] font-bold">
                      {formatKes(paidSummary?.totalPaid ?? 0)}
                    </span>
                  )}
                </Field>
                <Field label="Balance Remaining (KES)">
                  {paidSummaryLoading ? (
                    <ShimmerLine w="80px" h="14px" />
                  ) : (
                    <span className="text-amber-400 font-bold">
                      {formatKes(paidSummary?.remainingBalance ?? invoice.total)}
                    </span>
                  )}
                </Field>
              </div>
            </div>
          )}

          {!hasFullDetail ? (
            <div className="gv-card">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-white/40" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
              </div>
              <ShimmerLine w="80%" h="13px" />
            </div>
          ) : invoice.notes ? (
            <div className="gv-card">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-white/40" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
              </div>
              <p className="text-sm text-white/60 italic leading-relaxed">{invoice.notes}</p>
            </div>
          ) : null}

          {/* Line items — genuinely detail-only, shimmer until the full response lands */}
          <div className="gv-card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {hasFullDetail ? `Line Items — ${invoice.items.length} entries` : 'Line Items'}
              </h3>
            </div>
            {!hasFullDetail ? (
              <div className="divide-y divide-white/10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-6 py-4">
                    <ShimmerLine w="16px" h="13px" />
                    <ShimmerLine w="200px" h="13px" />
                    <ShimmerLine w="40px" h="13px" />
                    <ShimmerLine w="80px" h="13px" />
                    <ShimmerLine w="80px" h="13px" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-125">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40
                            ${i >= 2 ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white/30 w-10">{item.index}</td>
                        <td className="px-6 py-4 text-sm text-white">{item.particulars}</td>
                        <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60 text-right tabular-nums">
                          {formatKes(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#33907C] text-right tabular-nums">
                          {formatKes(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5 border-t border-white/20">
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/50"
                      >
                        Grand Total
                      </td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-[#33907C] tabular-nums">
                        KES {formatKes(invoice.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {(canRecordPayment || canReject) && (
            <div className="flex items-center justify-end gap-3 flex-wrap">
              {canRecordPayment && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!hasFullDetail}
                  className="flex items-center gap-2 bg-[#33907C]/15 hover:bg-[#33907C]/25 border border-[#33907C]/35
                             text-[#33907C] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DollarSign size={14} />
                  Record Payment
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => { setRejectError(null); setShowRejectModal(true); }}
                  disabled={!hasFullDetail}
                  className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/35
                             text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              )}
            </div>
          )}
        </>
      )}

      {showRejectModal && (
        <ModalShell onClose={() => !rejecting && setShowRejectModal(false)}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reject this invoice?</h3>
              <p className="text-sm text-white/50 mt-1">
                This will mark invoice {invoice?.invoiceNo} as rejected. This cannot be undone.
              </p>
            </div>
          </div>

          {rejectError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {rejectError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRejectModal(false)}
              disabled={rejecting}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={rejecting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600
                         text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {rejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              {rejecting ? 'Rejecting…' : 'Reject Invoice'}
            </button>
          </div>
        </ModalShell>
      )}

      {showPaymentModal && (
        <ModalShell onClose={() => !submittingPayment && setShowPaymentModal(false)}>
          <h3 className="text-lg font-bold text-white">Record Payment</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Amount (KES)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="gv-input mt-1 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Notes (optional)</label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="gv-input mt-1 text-sm"
                rows={2}
              />
            </div>
            {paymentError && <p className="text-red-400 text-xs">{paymentError}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={submittingPayment}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordPayment}
              disabled={submittingPayment}
              className="flex-1 flex items-center justify-center gap-2 bg-[#33907C] hover:bg-[#2a7566]
                         text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {submittingPayment ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {submittingPayment ? 'Saving…' : 'Save Payment'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}