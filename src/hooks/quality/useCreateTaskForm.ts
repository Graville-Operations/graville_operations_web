'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cacheBust } from '@/lib/persistent-cache';
import { getSite, type Site } from '@/lib/sites-cache';
import { createTask } from '@/lib/api/quality';
import { extractErrorMessage } from '@/lib/utils/extract-error-message';

interface TaskFormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

const emptyForm = (): TaskFormState => ({ name: '', description: '', start_date: '', end_date: '' });

export function useCreateTaskForm() {
  const router = useRouter();
  const params = useParams();
  const siteId = Number(params.siteId);

  const [form, setForm]             = useState<TaskFormState>(emptyForm());
  const [site, setSite]             = useState<Site | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    const cached = getSite(siteId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setSite(cached);
  }, [siteId]);

  const updateField = useCallback((field: keyof TaskFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const dateRangeSummary = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;
    const start = new Date(form.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = new Date(form.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} → ${end}`;
  }, [form.start_date, form.end_date]);

  const canSubmit = !submitting && !!form.name.trim() && !!form.start_date && !!form.end_date;

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setError('Task name is required'); return; }
    if (!siteId)            { setError('Missing site context'); return; }
    if (!form.start_date)   { setError('Start date is required'); return; }
    if (!form.end_date)     { setError('End date is required'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await createTask({
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        site_id:     siteId,
        start_date:  form.start_date,
        end_date:    form.end_date,
      });
      cacheBust(`tasks:${siteId}`);
      router.push(`/quality/dashboard/${siteId}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create task'));
      setSubmitting(false);
    }
  }, [form, siteId, router]);

  const goBack = useCallback(() => router.push(`/quality/dashboard/${siteId}`), [router, siteId]);

  return {
    siteId,
    site,
    form,
    updateField,
    dateRangeSummary,
    canSubmit,
    submitting,
    error,
    handleSubmit,
    goBack,
  };
}