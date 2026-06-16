'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus, SiteStatus } from '@/types/site';
import { ArrowLeft, Plus, X, Loader2, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'PLANNING',    label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD',     label: 'On Hold' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'CANCELLED',   label: 'Cancelled' },
];

const SITE_STATUS_OPTIONS: { value: SiteStatus; label: string }[] = [
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'CLOSED',   label: 'Closed' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Date Picker ─────────────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const today = new Date();
  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parse selected date for highlighting
  const selected = value ? new Date(value + 'T00:00:00') : null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth()    === viewMonth &&
    selected.getDate()     === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === day;

  const displayValue = selected
    ? selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger input */}
      <div
        className="gv-input w-full flex items-center justify-between cursor-pointer select-none"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
        onClick={() => !disabled && setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        <span style={{ color: displayValue ? '#fff' : 'var(--gv-text-subtle)' }}>
          {displayValue || 'Pick a date'}
        </span>
        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gv-text-muted)' }} />
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 rounded-xl p-4 w-72"
          style={{
            background: 'rgba(13,21,40,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--gv-glass-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Month / Year header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--gv-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-semibold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--gv-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium py-1"
                style={{ color: 'var(--gv-text-subtle)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;

              const sel   = isSelected(day);
              const todayFlag = isToday(day);

              return (
                <button
                  key={`d-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="flex items-center justify-center rounded-lg text-sm h-8 w-8 mx-auto transition-all"
                  style={{
                    background: sel
                      ? '#33907C'
                      : todayFlag
                      ? 'rgba(51,144,124,0.15)'
                      : 'transparent',
                    color: sel
                      ? '#fff'
                      : todayFlag
                      ? '#33907C'
                      : 'var(--gv-text-muted)',
                    fontWeight: sel || todayFlag ? 600 : 400,
                    border: todayFlag && !sel ? '1px solid rgba(51,144,124,0.4)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={e => {
                    if (!sel) e.currentTarget.style.background = todayFlag ? 'rgba(51,144,124,0.15)' : 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {value && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-xs py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--gv-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Supporting components ────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="gv-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gv-card space-y-4">
      <p className="gv-eyebrow">{title}</p>
      {children}
    </div>
  );
}

// ── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  location: string;
  project_status: ProjectStatus | '';
  site_status: SiteStatus;
  description: string;
  tender_name: string;
  inquiring_entity: string;
  completion_date: string;
  tagInput: string;
  tags: string[];
}

const EMPTY: FormState = {
  name: '', location: '', project_status: '', site_status: 'ACTIVE',
  description: '', tender_name: '', inquiring_entity: '',
  completion_date: '', tagInput: '', tags: [],
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router                      = useRouter();
  const [form, setForm]             = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    setForm((p) => ({ ...p, tags: [...p.tags, tag], tagInput: '' }));
  };

  const removeTag = (tag: string) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())    { setError('Site name is required.');      return; }
    if (!form.project_status) { setError('Project status is required.'); return; }

    setSubmitting(true);
    setError(null);

    const payload: CreateSitePayload = {
      name:           form.name.trim(),
      project_status: form.project_status as ProjectStatus,
      site_status:    form.site_status,
      ...(form.location         && { location:         form.location }),
      ...(form.description      && { description:      form.description }),
      ...(form.tender_name      && { tender_name:      form.tender_name }),
      ...(form.inquiring_entity && { inquiring_entity: form.inquiring_entity }),
      ...(form.completion_date  && { completion_date:  form.completion_date }),
      ...(form.tags.length > 0  && { tags:             form.tags }),
    };

    try {
      await createSite(payload);
      router.push('/projects/sites');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gv-page-dashboard w-full px-6 pb-16 pt-6" style={{ maxWidth: '96rem' }}>

      <Link href="/projects/dashboard"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--gv-text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-text-muted)')}>
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">New Project</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gv-text-muted)' }}>
          Fill in the details below to register a new site
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Basic Information ── */}
        <Section title="Basic Information">
          <Field label="Site name" required>
            <input
              className="gv-input w-full"
              placeholder="e.g. Nairobi Central Site"
              value={form.name}
              onChange={set('name')}
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project status" required>
              <select
                className="gv-input w-full"
                value={form.project_status}
                onChange={set('project_status')}
                disabled={submitting}
              >
                <option value="" disabled style={{ background: '#0d1528' }}>Select status</option>
                {PROJECT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: '#0d1528' }}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Site status">
              <select
                className="gv-input w-full"
                value={form.site_status}
                onChange={set('site_status')}
                disabled={submitting}
              >
                {SITE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: '#0d1528' }}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location">
              <input
                className="gv-input w-full"
                placeholder="e.g. Westlands, Nairobi"
                value={form.location}
                onChange={set('location')}
                disabled={submitting}
              />
            </Field>

            {/* ── Completion date with calendar picker ── */}
            <Field label="Completion date">
              <DatePicker
                value={form.completion_date}
                onChange={(v) => setForm((p) => ({ ...p, completion_date: v }))}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Tender Name">
            <textarea
              className="gv-input resize-none w-full"
              rows={4}
              placeholder="Brief description of the site or project..."
              value={form.description}
              onChange={set('description')}
              disabled={submitting}
            />
          </Field>
        </Section>

        {/* ── Entity Details ── */}
        <Section title="Entity Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tenderer">
              <input
                className="gv-input w-full"
                placeholder="e.g. Tender #2024-001"
                value={form.tender_name}
                onChange={set('tender_name')}
                disabled={submitting}
              />
            </Field>
            <Field label="Procuring entity">
              <input
                className="gv-input w-full"
                placeholder="e.g. Ministry of Works"
                value={form.inquiring_entity}
                onChange={set('inquiring_entity')}
                disabled={submitting}
              />
            </Field>
          </div>
        </Section>

        {/* ── Tags ── */}
        <Section title="Tags">
          <Field label="Add tags" hint="Press Enter or click + to add a tag">
            <div className="flex gap-2">
              <input
                className="gv-input w-full"
                placeholder="e.g. urban, phase-1"
                value={form.tagInput}
                onChange={set('tagInput')}
                disabled={submitting}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={submitting}
                className="gv-btn-outline px-3 py-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Field>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--gv-glass-bg-strong)', border: '1px solid var(--gv-glass-border)', color: '#fff' }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={submitting}
                    className="ml-0.5 transition-colors"
                    style={{ color: 'var(--gv-text-muted)' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/projects/dashboard">
            <button type="button" className="gv-btn-outline" disabled={submitting}>
              Cancel
            </button>
          </Link>
          <button type="submit" className="gv-btn-brand" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" />Create project</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}