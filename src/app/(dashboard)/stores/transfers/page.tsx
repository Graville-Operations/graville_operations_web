'use client';

import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import EmptyState from '@/components/ui/emptystate';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useTransfers } from '@/hooks/stores/useTransfers';
import { TransferRow, TRANSFER_STATUS_META } from '@/types/transfer';
import { ROUTES } from '@/lib/routes';
import TransferStatusFilterDropdown from '@/components/stores/transfers/TransferStatusFilterDropdown';

const COLUMNS = ['Pickup Point', 'Destination', 'Item', 'Quantity', 'Status'];

function StatusPill({ status }: { status: TransferRow['status'] }) {
  const meta = TRANSFER_STATUS_META[status];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function ItemNames({ row }: { row: TransferRow }) {
  if (row.lineItems.length === 0) {
    return <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>—</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {row.lineItems.map((item, i) => (
        <span
          key={`${item.kind}-${i}`}
          className="text-sm whitespace-nowrap"
          style={{ color: 'var(--gv-text-primary)' }}
        >
          {item.name || '—'}
        </span>
      ))}
    </div>
  );
}

function ItemQuantities({ row }: { row: TransferRow }) {
  if (row.lineItems.length === 0) {
    return <span className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>—</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {row.lineItems.map((item, i) => (
        <span
          key={`${item.kind}-${i}`}
          className="text-sm tabular-nums"
          style={{ color: 'var(--gv-text-primary)' }}
        >
          {item.quantity}
        </span>
      ))}
    </div>
  );
}

export default function TransfersPage() {
  const router = useRouter();
  const {
    rows,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasFilter,
    siteName,
  } = useTransfers();

  const openDetail = (id: number) => router.push(ROUTES.stores.transfers.detail(id));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <ShimmerStyle />

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Store</Label>
          <Title size="lg" as="h1">Material Transfers</Title>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="gv-input flex items-center gap-3 py-2.5 px-4 flex-1 min-w-[16rem]">
          <Search size={15} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Search by item or route…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full placeholder:text-white/30"
            style={{ color: 'var(--gv-text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--gv-text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <TransferStatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
      </div>

      <Label size="sm" as="p" className="gv-eyebrow">
        All Transfers {!isLoading && `(${rows.length})`}
      </Label>

      <div className="gv-card p-0! overflow-hidden overflow-x-auto">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {COLUMNS.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
                  <td className="px-4 py-3"><Bone w="9rem" /></td>
                  <td className="px-4 py-3"><Bone w="9rem" /></td>
                  <td className="px-4 py-3"><Bone w="7rem" /></td>
                  <td className="px-4 py-3"><Bone w="3rem" /></td>
                  <td className="px-4 py-3"><Bone w="4.5rem" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : rows.length === 0 ? (
          <EmptyState
            fullScreen={false}
            title={hasFilter ? 'No transfers match your filters' : 'No transfers yet'}
            description={
              hasFilter
                ? 'Try a different search term or status.'
                : 'Material transfers between sites will show up here.'
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                {COLUMNS.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t, idx) => (
                <tr
                  key={t.id}
                  onClick={() => openDetail(t.id)}
                  className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] align-top"
                  style={{
                    borderBottom: idx < rows.length - 1 ? '1px solid var(--gv-glass-border)' : 'none',
                    boxShadow: 'inset 3px 0 0 0 transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'inset 3px 0 0 0 #33907c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 3px 0 0 0 transparent'; }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                      {t.pickUpPoint || siteName(t.sourceSiteId) || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                      {t.dropOffPoint || siteName(t.destinationSiteId) || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><ItemNames row={t} /></td>
                  <td className="px-4 py-3"><ItemQuantities row={t} /></td>
                  <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}