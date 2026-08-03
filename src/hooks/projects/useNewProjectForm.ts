'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus, SiteStatus } from '@/types/site';
import { ROUTES } from '@/lib/routes';

export interface NewProjectFormState {
  name: string;
  location: string;
  project_status: ProjectStatus | '';
  description: string;
  tender_name: string;
  inquiring_entity: string;
  completion_date: string;
  latitude: string;
  tagInput: string;
  tags: string[];
}

const EMPTY: NewProjectFormState = {
  name: '', location: '', project_status: '',
  description: '', tender_name: '', inquiring_entity: '',
  completion_date: '', latitude: '', tagInput: '', tags: [],
};

const DEFAULT_SITE_STATUS = SiteStatus.ACTIVE;

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

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!form.name.trim())             missing.push('Site name');
    if (!form.project_status)          missing.push('Project status');
    if (!form.location.trim())         missing.push('Location');
    if (!form.inquiring_entity.trim()) missing.push('Tenderer');
    if (!form.tender_name.trim())      missing.push('Tender Name');
    return missing;
  };

  const formatMissingFieldsMessage = (missing: string[]): string => {
    if (missing.length === 1) return `${missing[0]} is required.`;
    if (missing.length === 2) return `${missing[0]} and ${missing[1]} are required.`;
    return `${missing.slice(0, -1).join(', ')}, and ${missing[missing.length - 1]} are required.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing = getMissingFields();
    if (missing.length > 0) {
      setError(formatMissingFieldsMessage(missing));
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateSitePayload = {
      name:             form.name.trim(),
      project_status:   form.project_status as ProjectStatus,
      site_status:      DEFAULT_SITE_STATUS,
      location:         form.location.trim(),
      inquiring_entity: form.inquiring_entity.trim(),
      tender_name:      form.tender_name.trim(),
      ...(form.description      && { description:      form.description }),
      ...(form.completion_date  && { completion_date:  form.completion_date }),
      ...(form.latitude         && { latitude:         parseFloat(form.latitude) }),
      ...(form.tags.length > 0  && { tags:             form.tags }),
    };

    try {
      await createSite(payload);
      router.push(ROUTES.projects.sites);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return { form, set, setField, addTag, removeTag, handleSubmit, submitting, error };
}