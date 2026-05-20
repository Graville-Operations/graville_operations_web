'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import {
  User, Mail, Phone, Shield, KeyRound,
  Eye, EyeOff, Check, AlertCircle,
} from 'lucide-react';

interface ProfileData {
  ref_id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  role?: string;
  accountStatus?: string;
}

export default function AccountPage() {
  const { role, logout } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/auth/me');
      setProfile(data?.data ?? data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password:     passwordForm.new_password,
      });
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPasswordError(e.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-white">My Account</h2>
        <p className="text-sm text-blue-200/60">Manage your profile and security settings</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Profile card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-5 mb-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-[#33907C] rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-white text-xl font-bold">{initials}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {profile?.firstName} {profile?.middleName} {profile?.lastName}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#33907C]/20 text-[#33907C] border border-[#33907C]/30">
                  {role ?? profile?.role ?? '—'}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Mail size={16} className="text-white/40 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/40">Email</p>
                  <p className="text-sm text-white truncate">{profile?.email ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Phone size={16} className="text-white/40 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Phone</p>
                  <p className="text-sm text-white">{profile?.phone ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Shield size={16} className="text-white/40 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Role</p>
                  <p className="text-sm text-white">{profile?.role ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <User size={16} className="text-white/40 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Account Status</p>
                  <p className="text-sm text-white capitalize">
                    {profile?.accountStatus ?? 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change password card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <KeyRound size={18} className="text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Change Password</h3>
                <p className="text-xs text-white/40">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle size={15} className="shrink-0" />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg text-sm">
                  <Check size={15} className="shrink-0" />
                  {passwordSuccess}
                </div>
              )}

              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-blue-100/80 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-blue-100/80 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm font-medium text-blue-100/80 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-[#33907C] hover:bg-[#2a7a69] text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-red-300 mb-1">Sign Out</h3>
            <p className="text-sm text-white/40 mb-4">
              This will end your current session and redirect you to the login page.
            </p>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}