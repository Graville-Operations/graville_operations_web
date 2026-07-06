'use client';

interface SupplierInvoiceNotesProps {
  notes: string | null | undefined;
  isEnriching: boolean;
}

export default function SupplierInvoiceNotes({ notes, isEnriching }: SupplierInvoiceNotesProps) {
  if (!notes && !isEnriching) return null;

  return (
    <div className="gv-card">
      <p className="gv-eyebrow mb-2">Notes</p>
      {notes ? (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>{notes}</p>
      ) : (
        <div className="space-y-2">
          <div className="h-3 rounded animate-pulse w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-3 rounded animate-pulse w-3/4" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
      )}
    </div>
  );
}