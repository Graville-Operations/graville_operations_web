'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Role } from '@/types/users';

interface ConfirmDeleteRoleModalProps {
  role: Role | null;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteRoleModal({ role, deleting, error, onCancel, onConfirm }: ConfirmDeleteRoleModalProps) {
  return (
    <Dialog open={!!role} onOpenChange={(open) => { if (!open && !deleting) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete role?</DialogTitle>
          <DialogDescription>
            {role ? <>This will permanently delete the <span className="font-semibold">{role.name}</span> role.</> : null}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-sm">{error}</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}