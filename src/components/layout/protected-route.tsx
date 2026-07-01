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
    if (!cookieToken) {
      router.replace('/signin');
      setTimeout(() => setChecked(true), 0);
      return;
    }

    const storedUser = getUser();
    if (storedUser?.expires_at) {
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

  useEffect(() => {
    if (checked && !token) {
      const cookieToken = getToken();
      if (!cookieToken) {
        router.replace('/signin');
      }
    }
  }, [token, checked, router]);

  if (!checked) return null;

  const cookieToken = getToken();
  if (!cookieToken) return null;

  return <>{children}</>;
}