'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getToken, clearSession, getUser } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadFromStorage();

    const cookieToken = getToken();

    // No token — redirect immediately
    if (!cookieToken) {
      router.replace('/signin');
      setTimeout(() => setChecked(true), 0);
      return;
    }

    // Check if token has expired using stored expires_at
    const storedUser = getUser();
    if (storedUser?.expires_at) {
      // ✅ Parse directly — cookie already has timezone offset (+03:00)
      // Do NOT append 'Z' — that corrupts the offset and breaks the comparison
      const expiry = new Date(storedUser.expires_at);
      if (!isNaN(expiry.getTime()) && new Date() > expiry) {
        clearSession();
        router.replace('/signin');
        setTimeout(() => setChecked(true), 0);
        return;
      }
    }

    setTimeout(() => setChecked(true), 0);
  }, [loadFromStorage, router]);

  // Re-check whenever store token changes (e.g. after logout)
  useEffect(() => {
    if (checked && !token) {
      const cookieToken = getToken();
      if (!cookieToken) {
        router.replace('/signin');
      }
    }
  }, [token, checked, router]);

  // Don't render until auth check is complete
  if (!checked) return null;

  const cookieToken = getToken();
  if (!cookieToken) return null;

  return <>{children}</>;
}