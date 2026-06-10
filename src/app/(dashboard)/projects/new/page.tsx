'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus, SiteStatus } from '@/types/site';
import { ArrowLeft, Plus, X, Loader2, AlertCircle } from 'lucide-react';

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
            <Field label="Completion date" hint="Date as provided by the backend (e.g. 2025-12-31)">
              <input
                className="gv-input w-full"
                placeholder="e.g. 2025-12-31"
                value={form.completion_date}
                onChange={set('completion_date')}
                disabled={submitting}
              />
            </Field>
          </div>

          {/* renamed from "Description" → "Tender Name" */}
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
            {/* renamed "Tender name" → "Tenderer" */}
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