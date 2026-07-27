'use client';

import { useState, useRef, useEffect } from 'react';
import { UserCog, Mail, Phone, Repeat, UserMinus, Loader2 } from 'lucide-react';
import { useSiteOperator } from '@/hooks/sites/useSiteOperator';
import { OperatorPicker } from './OperatorPicker';
import { Button } from '@/components/ui/button';
import { FieldOperator } from '@/types/site-detail';

interface FieldOperatorCardProps {
  siteId: number;
  operator: FieldOperator | null;
  loading: boolean;
  onOperatorChange: () => void;
}

export function FieldOperatorCard({ siteId, operator, loading, onOperatorChange }: FieldOperatorCardProps) {
  const {
    unassignedOperators, loadingUnassigned, loadUnassignedOperators,
    assigning, assignOperator,
    replacing, replaceOperatorAction,
    unassigning, unassignOperatorAction,
  } = useSiteOperator(siteId, operator, onOperatorChange);

  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showReplaceDropdown, setShowReplaceDropdown] = useState(false);
  const [confirmingUnassign, setConfirmingUnassign] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false);
        setShowReplaceDropdown(false);
      }
    }
    if (showAssignDropdown || showReplaceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssignDropdown, showReplaceDropdown]);

  const openAssignDropdown = () => {
    setShowAssignDropdown((prev) => {
      const next = !prev;
      if (next) loadUnassignedOperators();
      return next;
    });
  };

  const openReplaceDropdown = () => {
    setShowReplaceDropdown((prev) => {
      const next = !prev;
      if (next) loadUnassignedOperators();
      return next;
    });
  };

  const handleAssign = async (operatorId: number) => {
    await assignOperator(operatorId);
    setShowAssignDropdown(false);
  };

  const handleReplace = async (operatorId: number) => {
    await replaceOperatorAction(operatorId);
    setShowReplaceDropdown(false);
  };

  const handleUnassign = async () => {
    await unassignOperatorAction();
    setConfirmingUnassign(false);
  };

  if (loading) {
    return (
      <div className="h-11 w-56 rounded-xl animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
    );
  }

  if (!operator) {
    return (
      <div className="relative inline-block" ref={wrapperRef}>
        <button
          type="button"
          onClick={openAssignDropdown}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)', color: 'var(--gv-brand)' }}
        >
          <UserCog className="w-4 h-4" />
          Assign Field Operator
        </button>

        {showAssignDropdown && (
          <div
            className="absolute z-40 mt-2 w-72"
            style={{
              background: 'var(--gv-glass-bg-strong)',
              border: '1px solid var(--gv-glass-border)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <OperatorPicker
              operators={unassignedOperators}
              loading={loadingUnassigned}
              submitting={assigning}
              confirmLabel="Assign Operator"
              onConfirm={handleAssign}
              onCancel={() => setShowAssignDropdown(false)}
              emptyMessage="No unassigned operators available"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex items-center justify-between gap-6 px-4 py-3 rounded-xl"
        style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserCog className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-brand)' }} />
            {operator.name}
          </span>
          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            <Mail className="w-4 h-4 flex-shrink-0" />
            {operator.email || 'No email on file'}
          </span>
          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
            <Phone className="w-4 h-4 flex-shrink-0" />
            {operator.phone || 'No phone number on file'}
          </span>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={openReplaceDropdown} disabled={replacing || unassigning}>
            <Repeat className="w-3.5 h-3.5" />
            Replace
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmingUnassign(true)} disabled={replacing || unassigning}>
            <UserMinus className="w-3.5 h-3.5" />
            Unassign
          </Button>
        </div>
      </div>

      {showReplaceDropdown && (
        <div
          className="absolute z-40 right-0 mt-2 w-72"
          style={{
            background: 'var(--gv-glass-bg-strong)',
            border: '1px solid var(--gv-glass-border)',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <OperatorPicker
            operators={unassignedOperators}
            loading={loadingUnassigned}
            submitting={replacing}
            confirmLabel="Replace Operator"
            onConfirm={handleReplace}
            onCancel={() => setShowReplaceDropdown(false)}
            emptyMessage="No unassigned operators available"
          />
        </div>
      )}

      {confirmingUnassign && (
        <div
          className="absolute z-40 right-0 mt-2 w-72 p-4 rounded-xl"
          style={{
            background: 'var(--gv-glass-bg-strong)',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--gv-text-muted)' }}>
            Unassign {operator.name} from this site?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmingUnassign(false)} disabled={unassigning}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleUnassign} disabled={unassigning}>
              {unassigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
              {unassigning ? 'Unassigning…' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}