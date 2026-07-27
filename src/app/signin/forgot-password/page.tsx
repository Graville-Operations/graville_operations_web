'use client';
import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForgotPasswordForm } from '@/hooks/auth/useForgotPasswordForm';
import { ROUTES } from '@/lib/routes';

export default function ForgotPasswordPage() {
  const {
    step, email, setEmail, otp, setOtp,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    error, info, isLoading,
    handleRequestCode, handleResetPassword, goBackToEmail,
  } = useForgotPasswordForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#1a3a6e_0%,#0a0f1e_60%,#000000_100%)]">
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <Link
          href={ROUTES.signin}
          className="flex items-center gap-1.5 text-sm text-blue-200/60 hover:text-blue-200 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#173990]/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            {step === 'email' ? <Mail size={26} className="text-white" /> : <KeyRound size={26} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 'email' ? 'Forgot Password' : step === 'reset' ? 'Reset Password' : 'Success'}
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'reset' && `Enter the code sent to ${email} and choose a new password`}
            {step === 'done' && 'Redirecting you to sign in...'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@graville.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500/80 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {info && (
              <div className="bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg text-sm">
                {info}
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">Reset Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm text-center text-xl tracking-[0.5em] font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full bg-blue-500/80 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={goBackToEmail}
              className="w-full text-sm text-blue-200/60 hover:text-blue-200 transition-colors py-1"
            >
              Didn&apos;t receive it? Go back and resend
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg text-sm text-center">
            {info}
          </div>
        )}
      </div>
    </div>
  );
}