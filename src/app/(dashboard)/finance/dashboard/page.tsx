'use client';
import { useRouter } from 'next/navigation';
import {
  Building2, Users, Truck, HardHat,
  AlertTriangle, ChevronRight, RefreshCw, FileText,
  Coins,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';


interface PaginatedResponse {
  items: unknown[];
  total: number;
  skip:  number;
  limit: number;
}
const CARD_H = 'min-h-[9rem]';


function CardSkeleton() {
  return (
    <div className={`gv-card ${CARD_H} w-full overflow-hidden relative`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}


interface InvoiceCardProps {
  label:   string;
  total:   number | null;
  loading: boolean;
  error:   boolean;
  icon:    React.ReactNode;
  onClick: () => void;
  onRetry: () => void;
}

function InvoiceCard({ label, total, loading, error, icon, onClick, onRetry }: InvoiceCardProps) {
  if (loading) return <CardSkeleton />;

  if (error && total === null) {
    return (
      <div className={`gv-card ${CARD_H} w-full flex flex-col items-center justify-center
                       text-center border-[color:var(--gv-border-danger)]`}>
        <AlertTriangle size={24} className="text-[color:var(--destructive)] opacity-40 mb-2" />
        <p className="text-xs text-[color:var(--muted-foreground)] mb-2">Failed to load</p>
        <button
          onClick={(e) => { e.stopPropagation(); onRetry(); }}
          className="gv-tag border-[color:var(--gv-glass-border)] hover:border-[color:var(--gv-glass-border-hover)]
                     cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={10} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`gv-card ${CARD_H} w-full flex flex-col justify-between
                  border-[color:var(--border)] cursor-pointer
                  hover:bg-[color:var(--gv-glass-bg-strong)] hover:border-[color:var(--gv-glass-border-hover)]
                  hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)]
                  transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="gv-icon-box">
          <span className="text-[color:var(--primary)]">{icon}</span>
        </div>
        <ChevronRight size={14} className="text-[color:var(--gv-text-faint)]" />
      </div>
      <div>
        <p className="gv-label">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
          {total ?? 0}
        </p>
        <p className="text-[color:var(--muted-foreground)] text-xs mt-1">
          Tap to view {label.toLowerCase()}
        </p>
      </div>
    </div>
  );
}


export default function FinanceDashboardPage() {
  const router = useRouter();

  const { data: companyData,    loading: companyLoading,    error: companyError,    refetch: refetchCompany }    = useApi<PaginatedResponse>('/company-invoices/all?limit=1');
  const { data: clientData,     loading: clientLoading,     error: clientError,     refetch: refetchClient }     = useApi<PaginatedResponse>('/client-invoices/all?limit=1');
  const { data: supplierData,   loading: supplierLoading,   error: supplierError,   refetch: refetchSupplier }   = useApi<PaginatedResponse>('/invoices/all?limit=1');
  const { data: contractorData, loading: contractorLoading, error: contractorError, refetch: refetchContractor } = useApi<PaginatedResponse>('/subcontractor-invoices/all?limit=1');

  const cards = [
    {
      label:   'Company Invoices',
      total:   companyData?.total    ?? null,
      loading: companyLoading,
      error:   !!companyError,
      icon:    <Building2 size={18} />,
      onClick: () => router.push('/finance/invoice/company'),
      onRetry: refetchCompany,
    },
    {
      label:   'Client Invoices',
      total:   clientData?.total     ?? null,
      loading: clientLoading,
      error:   !!clientError,
      icon:    <Users size={18} />,
      onClick: () => router.push('/finance/invoice/client'),
      onRetry: refetchClient,
    },
    {
      label:   'Supplier Invoices',
      total:   supplierData?.total   ?? null,
      loading: supplierLoading,
      error:   !!supplierError,
      icon:    <Truck size={18} />,
      onClick: () => router.push('/finance/invoice/supplier'),
      onRetry: refetchSupplier,
    },
    {
      label:   'Sub-Contractor Invoices',
      total:   contractorData?.total ?? null,
      loading: contractorLoading,
      error:   !!contractorError,
      icon:    <HardHat size={18} />,
      onClick: () => router.push('/finance/invoice/contractor'),
      onRetry: refetchContractor,
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Finance</p>
          <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Coins size={13} className="text-[color:var(--primary)]" />
        <span className="text-sm text-[color:var(--muted-foreground)]">
          Financial overview across all sites and invoice types
        </span>
      </div>

      <div className="gv-card flex items-start gap-4">
        <div className="gv-icon-box flex-shrink-0">
          <FileText size={18} className="text-[color:var(--primary)]" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-[color:var(--foreground)]">Finance Overview</p>
          <p className="text-sm text-[color:var(--muted-foreground)] leading-relaxed">
            Consolidated view of all financial activity across this company. Track invoices
            raised against clients, suppliers, sub-contractors, and company accounts in one place.
            Select any card below to view the full list of invoices for that particular category.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-4">Available Invoice Types</h2>
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {cards.map((c) => (
            <InvoiceCard key={c.label} {...c} />
          ))}
        </div>
      </div>

    </div>
  );
}