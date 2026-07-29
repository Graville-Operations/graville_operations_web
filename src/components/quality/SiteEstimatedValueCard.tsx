'use client';

import { useState, useEffect } from 'react';
import { Wallet, Loader2, Check, AlertCircle } from 'lucide-react';

interface SiteEstimatedValueCardProps {
  value: number;
  onSave: (newValue: number) => Promise<void>;
}

export default function SiteEstimatedValueCard({ value, onSave }: SiteEstimatedValueCardProps) {
  const [input, setInput] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saving) setInput(String(value ?? ''));
  }, [value, saving]);

  const parsed = Number(input);
  const isValid = input.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0;
  const isUnchanged = parsed === value;

  async function handleSave() {
    if (!isValid || isUnchanged) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await onSave(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to update estimated value.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gv-card p-4 flex items-start gap-3">
      <Wallet size={18} className="text-[var(--gv-text-subtle)] flex-shrink-0 mt-2" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--gv-text-subtle)] mb-1.5">Estimated Value</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter estimated value"
            className="gv-input text-sm max-w-52"
          />
          <button
            onClick={handleSave}
            disabled={saving || !isValid || isUnchanged}
            className="gv-btn-outline text-sm px-3 py-1.5 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save'}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Check size={13} /> Saved
            </span>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
            <AlertCircle size={12} /> {error}
          </p>
        )}
        {input.trim() !== '' && !Number.isNaN(parsed) && parsed < 0 && (
          <p className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
            <AlertCircle size={12} /> Estimated value can&apos;t be negative.
          </p>
        )}
      </div>
    </div>
  );
}