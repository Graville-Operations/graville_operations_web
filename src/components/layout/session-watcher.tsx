'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getExpiresAt, clearSession } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { useMenuStore } from '@/store/menu-store';
import { useUserStore } from '@/store/user-store';
import { useInvoiceStore } from '@/store/invoice-store';

const CHECK_INTERVAL_MS = 60 * 1000;

function isSessionExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  const expiresAt = getExpiresAt();
  if (!expiresAt) return false; 

  const expiry = new Date(expiresAt);
  if (isNaN(expiry.getTime())) return false; 

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
    if (isSessionExpired()) {
      handleExpiry();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (isSessionExpired()) {
        handleExpiry();
      }
    }, CHECK_INTERVAL_MS);

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