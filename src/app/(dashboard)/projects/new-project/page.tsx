'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus, SiteStatus } from '@/types/site';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
  'placeholder:text-muted-foreground focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';

function Field({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
  latitude: string;
  longitude: string;
  tagInput: string;
  tags: string[];
}

const EMPTY: FormState = {
  name: '', location: '', project_status: '', site_status: 'ACTIVE',
  description: '', tender_name: '', inquiring_entity: '',
  completion_date: '', latitude: '', longitude: '', tagInput: '', tags: [],
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
      ...(form.latitude         && { latitude:         parseFloat(form.latitude) }),
      ...(form.longitude        && { longitude:        parseFloat(form.longitude) }),
      ...(form.tags.length > 0  && { tags:             form.tags }),
    };

    try {
      await createSite(payload);
      router.push('/projects/dashboard');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to create project. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">

      <Link
        href="/projects/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold">New project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to register a new site
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* basic info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Site name" required>
              <input className={inputCls} placeholder="e.g. Nairobi Central Site"
                value={form.name} onChange={set('name')} disabled={submitting} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project status" required>
                <select className={inputCls} value={form.project_status}
                  onChange={set('project_status')} disabled={submitting}>
                  <option value="" disabled>Select status</option>
                  {PROJECT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Site status">
                <select className={inputCls} value={form.site_status}
                  onChange={set('site_status')} disabled={submitting}>
                  {SITE_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location">
                <input className={inputCls} placeholder="e.g. Westlands, Nairobi"
                  value={form.location} onChange={set('location')} disabled={submitting} />
              </Field>
              <Field label="Completion date">
                <input type="date" className={inputCls}
                  value={form.completion_date} onChange={set('completion_date')} disabled={submitting} />
              </Field>
            </div>

            <Field label="Description">
              <textarea className={`${inputCls} resize-none`} rows={3}
                placeholder="Brief description of the site or project..."
                value={form.description} onChange={set('description')} disabled={submitting} />
            </Field>
          </CardContent>
        </Card>

        {/* entity details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tender name">
                <input className={inputCls} placeholder="e.g. Tender #2024-001"
                  value={form.tender_name} onChange={set('tender_name')} disabled={submitting} />
              </Field>
              <Field label="Inquiring entity">
                <input className={inputCls} placeholder="e.g. Ministry of Works"
                  value={form.inquiring_entity} onChange={set('inquiring_entity')} disabled={submitting} />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* coordinates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Geo Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" hint="Decimal degrees, e.g. -1.2921">
                <input type="number" step="any" className={inputCls} placeholder="-1.2921"
                  value={form.latitude} onChange={set('latitude')} disabled={submitting} />
              </Field>
              <Field label="Longitude" hint="Decimal degrees, e.g. 36.8219">
                <input type="number" step="any" className={inputCls} placeholder="36.8219"
                  value={form.longitude} onChange={set('longitude')} disabled={submitting} />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* tags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Add tags" hint="Press Enter or click + to add a tag">
              <div className="flex gap-2">
                <input className={inputCls} placeholder="e.g. urban, phase-1"
                  value={form.tagInput} onChange={set('tagInput')} disabled={submitting}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={submitting}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Field>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} disabled={submitting}
                      className="text-muted-foreground hover:text-foreground ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/projects/dashboard">
            <Button type="button" variant="outline" disabled={submitting}>Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Creating...</>
            ) : (
              <><Plus className="w-3.5 h-3.5 mr-1.5" />Create project</>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}