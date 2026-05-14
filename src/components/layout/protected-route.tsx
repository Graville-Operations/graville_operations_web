'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getToken } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
  loadFromStorage();
  const cookieToken = getToken();
  if (!cookieToken) {
    router.replace('/login');
  }
  setTimeout(() => setChecked(true), 0);
}, []);

  useEffect(() => {
    if (checked && !token) {
      const cookieToken = getToken();
      if (!cookieToken) {
        router.replace('/login');
      }
    }
  }, [token, checked]);

  // Don't render children until auth check is complete
  if (!checked) return null;

  const cookieToken = getToken();
  if (!cookieToken) return null;

  return <>{children}</>;
}