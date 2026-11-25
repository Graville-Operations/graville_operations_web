'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSite } from '@/lib/api/sites';
import { CreateSitePayload, ProjectStatus } from '@/types/site';
import { ROUTES } from '@/lib/routes';

export interface NewProjectFormState {
  name: string;
  location: string;
  tender_name: string;        // -> tenderName       (saved as description)
  tenderer: string;           // -> tendererName     (saved as tenderer_name)
  procuring_entity: string;   // -> procuringEntity  (saved as inquiring_entity)
  completion_date: string;
  latitude: string;
  tagInput: string;
  tags: string[];
}

const EMPTY: NewProjectFormState = {
  name: '', location: '',
  tender_name: '', tenderer: '', procuring_entity: '',
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

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!form.name.trim())             missing.push('Site name');
    if (!form.location.trim())         missing.push('Location');
    if (!form.tender_name.trim())      missing.push('Tender Name');
    if (!form.tenderer.trim())         missing.push('Tenderer');
    if (!form.procuring_entity.trim()) missing.push('Procuring Entity');
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
      name:            form.name.trim(),
      location:        form.location.trim(),
      projectStatus:   ProjectStatus.PLANNING,
      tenderName:      form.tender_name.trim(),       
      tendererName:    form.tenderer.trim(),         
      procuringEntity: form.procuring_entity.trim(),  
      ...(form.completion_date     && { completionDate: form.completion_date }),
      ...(form.latitude            && { latitude: parseFloat(form.latitude) }),
      ...(form.tags.length > 0     && { tags: form.tags }),
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