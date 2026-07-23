'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, UserCog, Repeat, UserMinus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OperatorPicker } from './OperatorPicker';
import { FieldOperator } from '@/types/site-detail';

interface OperatorDetailOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operator: FieldOperator;
  unassignedOperators: FieldOperator[];
  loadingUnassigned: boolean;
  loadUnassignedOperators: () => void;
  replacing: boolean;
  onReplace: (operatorId: number) => Promise<void>;
  unassigning: boolean;
  onUnassign: () => Promise<void>;
}

export function OperatorDetailOverlay({
  open, onOpenChange, operator,
  unassignedOperators, loadingUnassigned, loadUnassignedOperators,
  replacing, onReplace,
  unassigning, onUnassign,
}: OperatorDetailOverlayProps) {
  const [mode, setMode] = useState<'view' | 'replace' | 'confirmUnassign'>('view');

  const handleClose = (next: boolean) => {
    if (replacing || unassigning) return;
    if (!next) setMode('view');
    onOpenChange(next);
  };

  const startReplace = () => {
    setMode('replace');
    loadUnassignedOperators();
  };

  const handleReplace = async (operatorId: number) => {
    await onReplace(operatorId);
    setMode('view');
  };

  const handleUnassign = async () => {
    await onUnassign();
    setMode('view');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Field Operator</DialogTitle>
          <DialogDescription>
            {mode === 'view' && 'Assigned to this site'}
            {mode === 'replace' && 'Choose a replacement operator'}
            {mode === 'confirmUnassign' && 'This will remove the operator from this site'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base text-white">
                <UserCog className="w-4 h-4" style={{ color: 'var(--gv-brand)' }} />
                {operator.name}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                <Mail className="w-4 h-4" />
                {operator.email || 'No email on file'}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                <Phone className="w-4 h-4" />
                {operator.phone || 'No phone number on file'}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={startReplace} disabled={replacing || unassigning}>
                <Repeat className="w-3.5 h-3.5" />
                Replace
              </Button>
              <Button variant="destructive" onClick={() => setMode('confirmUnassign')} disabled={replacing || unassigning}>
                <UserMinus className="w-3.5 h-3.5" />
                Unassign
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === 'replace' && (
          <OperatorPicker
            operators={unassignedOperators}
            loading={loadingUnassigned}
            submitting={replacing}
            confirmLabel="Replace Operator"
            onConfirm={handleReplace}
            onCancel={() => setMode('view')}
            emptyMessage="No unassigned operators available"
          />
        )}

        {mode === 'confirmUnassign' && (
          <>
            <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
              Are you sure you want to unassign {operator.name} from this site?
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMode('view')} disabled={unassigning}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUnassign} disabled={unassigning}>
                {unassigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                {unassigning ? 'Unassigning…' : 'Confirm Unassign'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}