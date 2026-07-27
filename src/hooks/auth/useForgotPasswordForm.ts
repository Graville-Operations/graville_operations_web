'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestPasswordReset, resetPassword } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/api-error';
import { ROUTES } from '@/lib/routes';

type Step = 'email' | 'reset' | 'done';

export function useForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const message = await requestPasswordReset(email);
      setInfo(message);
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const message = await resetPassword(email, otp, newPassword);
      setInfo(message);
      setStep('done');
      setTimeout(() => router.replace(ROUTES.signin), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setError('');
    setInfo('');
    setOtp('');
  };

  return {
    step, email, setEmail, otp, setOtp,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    error, info, isLoading,
    handleRequestCode, handleResetPassword, goBackToEmail,
  };
}