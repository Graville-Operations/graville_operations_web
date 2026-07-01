'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getExpiresAt, clearSession } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { useMenuStore } from '@/store/menu-store';
import { useUserStore } from '@/store/user-store';
import { useInvoiceStore } from '@/store/invoice-store';

// How often to check (in milliseconds) — every 60 seconds
const CHECK_INTERVAL_MS = 60 * 1000;

function isSessionExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  const expiresAt = getExpiresAt();
  if (!expiresAt) return false; // no expiry info — assume valid

  // ✅ Parse directly — cookie already contains timezone info (+03:00)
  // Do NOT append 'Z' — that would corrupt the timezone offset
  const expiry = new Date(expiresAt);
  if (isNaN(expiry.getTime())) return false; // malformed — don't log out

  return new Date() >= expiry;
}

export default function SessionWatcher() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleExpiry = () => {
    clearSession();
    logout();
    useMenuStore.getState().clearMenus();
    useUserStore.getState().clearUsers();
    useInvoiceStore.getState().clearInvoices();
    router.replace('/signin');
  };

  useEffect(() => {
    // Run once immediately on mount
    if (isSessionExpired()) {
      handleExpiry();
      return;
    }

    // Then check every 60 seconds
    intervalRef.current = setInterval(() => {
      if (isSessionExpired()) {
        handleExpiry();
      }
    }, CHECK_INTERVAL_MS);

    // Also check when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSessionExpired()) {
        handleExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}