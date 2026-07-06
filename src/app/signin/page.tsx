'use client';

import { useLoginForm } from '@/hooks/auth/useLoginForm';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { AuthCardHeader } from '@/components/auth/AuthCardHeader';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const {
    email, setEmail,
    password, setPassword,
    error, showPassword, togglePasswordVisibility,
    isLoading, handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#1a3a6e_0%,#0a0f1e_60%,#000000_100%)]">
      <AuthBackdrop />

      <div className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <AuthCardHeader title="Graville Operations" subtitle="Sign in to your account" />

        <LoginForm
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          showPassword={showPassword}
          onToggleShowPassword={togglePasswordVisibility}
          error={error}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}