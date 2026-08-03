'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldOperator } from '@/types/site';

interface OperatorPickerProps {
  operators: FieldOperator[];
  loading: boolean;
  submitting: boolean;
  confirmLabel: string;
  onConfirm: (operatorId: number) => void | Promise<void>;
  onCancel?: () => void;
  emptyMessage?: string;
}

export function OperatorPicker({
  operators, loading, submitting, confirmLabel, onConfirm, onCancel, emptyMessage,
}: OperatorPickerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedId == null || submitting) return;
    onConfirm(selectedId);
  };

  return (
    <div className="flex flex-col">
      <div className="max-h-64 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
          </div>
        ) : operators.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--gv-text-subtle)' }}>
            {emptyMessage ?? 'No operators available'}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {operators.map((op) => {
              const isSelected = selectedId === op.id;
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setSelectedId(op.id)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
                  style={{
                    background: isSelected ? 'rgba(51,144,124,0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(51,144,124,0.4)' : '1px solid transparent',
                  }}
                >
                  <span className="flex flex-col">
                    <span className="font-semibold" style={{ color: isSelected ? 'var(--gv-brand)' : 'white' }}>
                      {op.name}
                    </span>
                    {op.email && (
                      <span className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>{op.email}</span>
                    )}
                  </span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-3 py-2.5" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleConfirm} disabled={submitting || selectedId == null}>
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {submitting ? 'Submitting…' : confirmLabel}
        </Button>
      </div>
    </div>
  );
}