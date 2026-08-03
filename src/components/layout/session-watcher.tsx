'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getExpiresAt } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/routes';

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
    logout();
    router.replace(ROUTES.signin);
  };

  useEffect(() => {
    if (isSessionExpired()) {
      handleExpiry();
      return;
    }
    useAuthStore.getState().loadFromStorage();

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

  }, []);

  return null;
}