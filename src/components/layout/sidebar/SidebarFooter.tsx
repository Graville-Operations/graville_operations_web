'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Bell } from 'lucide-react';
import { formatRole } from '@/lib/utils/format-role';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface SidebarFooterProps {
  user: { first_name?: string; last_name?: string } | null;
  role?: string | null;
  onLogout: () => void;
}

export function SidebarFooter({ user, role, onLogout }: SidebarFooterProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <div className="p-3 border-t border-white/10 space-y-1">
      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150">
        <div className="relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>
        <span>Notifications</span>
      </button>

      <Link
        href="/account"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
      >
        <div className="w-7 h-7 bg-[#33907C] rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-white/40 truncate">{formatRole(role ?? undefined)}</p>
        </div>
        <User size={14} className="shrink-0 opacity-40" />
      </Link>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
      >
        <LogOut size={16} />
        Logout
      </button>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}