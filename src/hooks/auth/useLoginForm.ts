'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/routes';
import { getLoginErrorMessage } from '@/lib/errors';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
      setError('');
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.replace(ROUTES.home);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(getLoginErrorMessage(err, 'Login failed. Please try again.'));
      setPassword('');
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return {
    email, setEmail,
    password, setPassword,
    error, showPassword, togglePasswordVisibility,
    isLoading, handleSubmit,
  };
}