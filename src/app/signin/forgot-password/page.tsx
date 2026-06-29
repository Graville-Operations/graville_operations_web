'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react';
import api from '@/lib/api';
import { saveToken, saveRole, saveUser } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { API } from '@/lib/endpoints';
import { ROUTES } from '@/lib/routes';

type Step = 'email' | 'otp';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { loadFromStorage } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post(API.auth.login, { email, password: '' });
    } catch {
    } finally {
      setIsLoading(false);
      setStep('otp');
      setSuccess('If this email exists, an OTP has been sent to it.');
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post(API.auth.verifyOtp, { email, otp });
      const payload = data?.data ?? data;

      if (payload?.token) {
        saveToken(payload.token);
        saveRole(payload.role);

        const meRes = await api.get(API.auth.me, {
          headers: { Authorization: `Bearer ${payload.token}` },
        });
        const user = meRes.data?.data ?? meRes.data;
        saveUser(user);
        const { loadFromStorage } = useAuthStore();

        setSuccess('Verified! Redirecting to dashboard...');
        setTimeout(() => router.replace(ROUTES.home), 1500);
      } else {
        setSuccess('Verified! Please sign in.');
        setTimeout(() => router.replace(ROUTES.signin), 1500);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(
        e.response?.data?.message ||
        e.response?.data?.detail ||
        'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#1a3a6e_0%,#0a0f1e_60%,#000000_100%)]">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Glass card */}
      <div className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
        {/* Back link */}
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-blue-200/60 hover:text-blue-200 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to login
        </Link>

        {/* Icon + heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#173990]/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            {step === 'email'
              ? <Mail size={26} className="text-white" />
              : <KeyRound size={26} className="text-white" />
            }
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 'email' ? 'Forgot Password' : 'Verify OTP'}
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            {step === 'email'
              ? 'Enter your email to receive a verification code'
              : `Enter the OTP sent to ${email}`
            }
          </p>
        </div>

        {/* Step: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">
                Email Address
              </label>
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
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {success && (
              <div className="bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm text-center text-xl tracking-[0.5em] font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full bg-blue-500/80 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setSuccess(''); setOtp(''); }}
              className="w-full text-sm text-blue-200/60 hover:text-blue-200 transition-colors py-1"
            >
              Didn&apos;t receive it? Go back and resend
            </button>
          </form>
        )}
      </div>
    </div>
  );
}