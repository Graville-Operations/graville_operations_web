'use client';

import { useState, useRef, useEffect } from 'react';
import { UserCog, ChevronRight } from 'lucide-react';
import { useSiteOperator } from '@/hooks/sites/useSiteOperator';
import { OperatorPicker } from './OperatorPicker';
import { OperatorDetailOverlay } from './OperatorDetailOverlay';

export function FieldOperatorCard({ siteId }: { siteId: number }) {
  const {
    operator, loadingOperator,
    unassignedOperators, loadingUnassigned, loadUnassignedOperators,
    assigning, assignOperator,
    replacing, replaceOperatorAction,
    unassigning, unassignOperatorAction,
  } = useSiteOperator(siteId);

  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false);
      }
    }
    if (showAssignDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssignDropdown]);

  const openAssignDropdown = () => {
    setShowAssignDropdown((prev) => {
      const next = !prev;
      if (next) loadUnassignedOperators();
      return next;
    });
  };

  const handleAssign = async (operatorId: number) => {
    await assignOperator(operatorId);
    setShowAssignDropdown(false);
  };

  if (loadingOperator) {
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
    <>
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl text-left transition-colors"
        style={{ background: 'var(--gv-glass-bg)', border: '1px solid var(--gv-glass-border)' }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <UserCog className="w-4 h-4" style={{ color: 'var(--gv-brand)' }} />
          {operator.name}
        </span>
        <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--gv-brand)' }}>
          View all details <ChevronRight className="w-3 h-3" />
        </span>
      </button>

      <OperatorDetailOverlay
        open={showDetail}
        onOpenChange={setShowDetail}
        operator={operator}
        unassignedOperators={unassignedOperators}
        loadingUnassigned={loadingUnassigned}
        loadUnassignedOperators={loadUnassignedOperators}
        replacing={replacing}
        onReplace={replaceOperatorAction}
        unassigning={unassigning}
        onUnassign={unassignOperatorAction}
      />
    </>
  );
}