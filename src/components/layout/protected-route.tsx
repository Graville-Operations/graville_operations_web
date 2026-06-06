'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getToken, clearSession, getUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadFromStorage();

    const cookieToken = getToken();

    if (!cookieToken) {
      router.replace(ROUTES.signin);
      setTimeout(() => setChecked(true), 0);
      return;
    }

    const storedUser = getUser();
    if (storedUser?.expires_at) {
      const expiryStr = storedUser.expires_at.endsWith('Z')
        ? storedUser.expires_at
        : storedUser.expires_at + 'Z';
      const expiry = new Date(expiryStr);

      if (new Date() > expiry) {
        clearSession();
        router.replace(ROUTES.signin);
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
        router.replace(ROUTES.signin);
      }
    }
  }, [token, checked, router]);

  if (!checked) return null;

  const cookieToken = getToken();
  if (!cookieToken) return null;

  return <>{children}</>;
  
}