'use client';

import { useState, useEffect } from 'react';
import { CalendarRange, FileText, MapPin, Tag, Wallet, ClipboardList, Loader2, Check, AlertCircle } from 'lucide-react';
import type { SiteDetail } from '@/lib/api/quality';
import { formatDisplayDate } from '@/lib/utils/format-display-date';

interface SiteInfoCardProps {
  site: SiteDetail;
  onUpdateBQ?: () => void;
  onUpdateEstimatedValue: (newValue: number) => Promise<void>;
}

export default function SiteInfoCard({ site, onUpdateBQ, onUpdateEstimatedValue }: SiteInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(site.estimatedValue ?? ''));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!editing) setInput(String(site.estimatedValue ?? ''));
  }, [site.estimatedValue, editing]);

  const parsed = Number(input);
  const isValid = input.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0;
  const isUnchanged = parsed === site.estimatedValue;

  async function handleSave() {
    if (!isValid || isUnchanged) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await onUpdateEstimatedValue(parsed);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to update.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setInput(String(site.estimatedValue ?? ''));
    setEditing(false);
    setError(null);
  }

  return (
    <div className="gv-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="gv-tag bg-white/5 text-(--gv-text-muted) border border-(--gv-glass-border)">
          {site.projectStatus}
        </span>
        <span className="gv-tag bg-white/5 text-(--gv-text-muted) border border-(--gv-glass-border)">
          {site.siteStatus}
        </span>
      </div>

      {site.description && (
        <p className="text-sm text-(--gv-text-muted) leading-relaxed">{site.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        {/* Left column — site details */}
        <div className="space-y-4">
          {site.tendererName && (
            <div>
              <p className="gv-label mb-1">Company</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <FileText size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.tendererName}
              </p>
            </div>
          )}
          {site.location && (
            <div>
              <p className="gv-label mb-1">Location</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <MapPin size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.location}
              </p>
            </div>
          )}
          {site.completionDate && (
            <div>
              <p className="gv-label mb-1">Completion Date</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary)">
                <CalendarRange size={14} className="text-(--gv-text-subtle) shrink-0" />
                {formatDisplayDate(site.completionDate)}
              </p>
            </div>
          )}
          {site.tags && site.tags.length > 0 && (
            <div>
              <p className="gv-label mb-1">Tags</p>
              <p className="flex items-center gap-2 text-(--gv-text-primary) flex-wrap">
                <Tag size={14} className="text-(--gv-text-subtle) shrink-0" />
                {site.tags.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between h-full">
          <div>
            <p className="gv-label mb-2">Bill of Quantities</p>
            <button
              onClick={onUpdateBQ}
              className="gv-btn-outline gap-2 text-sm w-1/2"
              title="Coming soon — pending backend support"
            >
              <ClipboardList size={14} /> Add/Update BQ
            </button>
          </div>

          <div>
            <p className="gv-label mb-2">Estimated Value</p>

            {editing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter value"
                    className="gv-input text-sm max-w-40 py-1.5"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !isValid || isUnchanged}
                    className="gv-btn-outline text-sm px-3 py-1.5 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="text-xs text-(--gv-text-faint) hover:text-(--gv-text-muted) px-1"
                  >
                    Cancel
                  </button>
                </div>
                {input.trim() !== '' && !Number.isNaN(parsed) && parsed < 0 && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertCircle size={12} /> Can&apos;t be negative.
                  </p>
                )}
                {error && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="gv-btn-outline gap-2 text-sm w-1/2"
                >
                  <Wallet size={14} />
                  {site.estimatedValue?.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}
                </button>
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Check size={13} /> Saved
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}