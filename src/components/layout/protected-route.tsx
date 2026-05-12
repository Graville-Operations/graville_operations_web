'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!token) {
      const stored = typeof window !== 'undefined'
        ? document.cookie.includes('graville_token')
        : false;
      if (!stored) router.push('/login');
    }
  }, [token]);

  return <>{children}</>;
}