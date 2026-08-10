'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  totalInvoiced: number;
  remainingBalance?: number | null;
  onSubmit: (payload: { amount: number; notes?: string }) => void | Promise<void>;
}

export default function RecordPaymentModal({
  open,
  onOpenChange,
  submitting,
  totalInvoiced,
  remainingBalance,
  onSubmit,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const numericAmount = Number(amount);
  const isValid = amount.trim() !== '' && !Number.isNaN(numericAmount) && numericAmount > 0;

  const handleClose = (next: boolean) => {
    if (submitting) return;
    if (!next) {
      setAmount('');
      setNotes('');
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    await onSubmit({ amount: numericAmount, notes: notes.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Amount invoiced: KES {totalInvoiced.toLocaleString()}
            {typeof remainingBalance === 'number'
              ? ` · Remaining: KES ${remainingBalance.toLocaleString()}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--gv-text-muted)' }}>
              Amount (KES)
            </label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 40000"
              disabled={submitting}
            />
            <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
              Enter the full amount to mark as Paid, or a partial amount to mark as Partially Paid.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--gv-text-muted)' }}>
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared the payment"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !isValid}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? 'Recording…' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}