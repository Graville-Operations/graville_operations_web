'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus, SiteStatus } from '@/types/site';

export interface NewProjectFormState {
  name: string;
  location: string;
  project_status: ProjectStatus | '';
  site_status: SiteStatus;
  description: string;
  tender_name: string;
  inquiring_entity: string;
  completion_date: string;
  latitude: string;
  tagInput: string;
  tags: string[];
}

const EMPTY: NewProjectFormState = {
  name: '', location: '', project_status: '', site_status: 'ACTIVE',
  description: '', tender_name: '', inquiring_entity: '',
  completion_date: '', latitude: '', tagInput: '', tags: [],
};

export function useNewProjectForm() {
  const router = useRouter();
  const [form, setForm]             = useState<NewProjectFormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const set = (key: keyof NewProjectFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setField = <K extends keyof NewProjectFormState>(key: K, value: NewProjectFormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

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
      ...(form.tags.length > 0  && { tags:             form.tags }),
    };

    try {
      await createSite(payload);
      router.push('/projects/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return { form, set, setField, addTag, removeTag, handleSubmit, submitting, error };
}