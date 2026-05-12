'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading} = useAuthStore();
  const router = useRouter();

  // Clear form when user lands on login page (e.g. after logout)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      setPassword(''); // Clear password on failed attempt, keep email
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1a3a6e_0%,_#0a0f1e_60%,_#000000_100%)]">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Glass card */}
      <div className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#173990]/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Graville Operations</h1>
          <p className="text-blue-200/70 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@graville.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 backdrop-blur-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500/80 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}