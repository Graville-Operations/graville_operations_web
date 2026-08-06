'use client';

import { PulseBox } from '@/components/shared/Shimmer';

interface CompanyInvoiceNotesProps {
  notes: string | null;
  isDetailLoading: boolean;
}

export default function CompanyInvoiceNotes({ notes, isDetailLoading }: CompanyInvoiceNotesProps) {
  return (
    <div className="gv-card">
      <p className="gv-eyebrow text-label-sm mb-1">Notes</p>
      {isDetailLoading && !notes ? (
        <PulseBox w="200px" h="13px" />
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: notes ? 'var(--gv-text-muted)' : 'var(--gv-text-faint)' }}>
          {notes ?? 'No notes'}
        </p>
      )}
    </div>
  );
}