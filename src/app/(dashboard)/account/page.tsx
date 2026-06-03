'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useProfileStore } from '@/store/profile-store';
import api from '@/lib/api';
import {
  User, Mail, Phone, Shield, KeyRound,
  Eye, EyeOff, Check, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { API } from '@/lib/endpoints';

type View = 'profile' | 'change-password';

export default function AccountPage() {
  const { role, logout } = useAuthStore();
  const { profile, isLoaded, setProfile } = useProfileStore();

  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [view, setView] = useState<View>('profile');

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

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(API.auth.me);
      const profileData = data?.data ?? data;
      setProfile(profileData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isLoaded) fetchProfile();
  }, [isLoaded, fetchProfile]);

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
      await api.post(API.auth.changePassword, {
        current_password: passwordForm.current_password,
        new_password:     passwordForm.new_password,
      });
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => {
        setPasswordSuccess('');
        setView('profile');
      }, 2000);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {view === 'change-password' && (
          <button
            onClick={() => { setView('profile'); setPasswordError(''); setPasswordSuccess(''); }}
            className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-white">
            {view === 'profile' ? 'My Account' : 'Change Password'}
          </h2>
          <p className="text-sm text-blue-200/60">
            {view === 'profile' ? 'Your profile and account details' : 'Update your account password'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : view === 'profile' ? (
        <>
          {/* Avatar + name */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg flex items-center gap-5">
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg space-y-3">
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Account Details
            </h4>
            {[
              { icon: Mail,   label: 'Email',          value: profile?.email },
              { icon: Phone,  label: 'Phone',          value: profile?.phone },
              { icon: Shield, label: 'Role',           value: profile?.role },
              { icon: User,   label: 'Account Status', value: profile?.accountStatus ?? 'Active' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-white/40" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-white/50">{label}</span>
                  <span className="text-sm text-white font-medium">{value ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg space-y-3">
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Security
            </h4>
            <button
              onClick={() => setView('change-password')}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <KeyRound size={15} className="text-blue-300" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Change Password</p>
                  <p className="text-xs text-white/40">Update your account password</p>
                </div>
              </div>
              <ArrowLeft size={16} className="text-white/30 rotate-180 group-hover:text-white/60 transition-colors" />
            </button>
          </div>

          {/* Sign out */}
          <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-white/40 mb-4">This will end your current session.</p>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        /* Change password view */
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
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

            {[
              { label: 'Current Password',    key: 'current_password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { label: 'New Password',         key: 'new_password',     show: showNew,     toggle: () => setShowNew(!showNew) },
              { label: 'Confirm New Password', key: 'confirm_password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-blue-100/80 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={(passwordForm as Record<string, string>)[key]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#33907C] hover:bg-[#2a7a69] text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}