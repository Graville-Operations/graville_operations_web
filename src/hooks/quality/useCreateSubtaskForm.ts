'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { SiteWorker } from '@/types/site';
import { fetchWorkersForSite, createSubtask } from '@/lib/api/quality';
import { getWorkerName } from '@/lib/utils/worker-helpers';
import { extractErrorMessage } from '@/lib/utils/extract-error-message';
import { ROUTES } from '@/lib/routes';

interface SubtaskFormState {
  name: string;
  description: string;
}

export function useCreateSubtaskForm() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.id);
  const siteId = Number(params?.siteId);

  const [form, setForm]                       = useState<SubtaskFormState>({ name: '', description: '' });
  const [workers, setWorkers]                 = useState<SiteWorker[]>([]);
  const [loadingWorkers, setLoadingWorkers]   = useState(true);
  const [workersError, setWorkersError]       = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [workerSearch, setWorkerSearch]       = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const loadWorkers = useCallback(async () => {
    if (!Number.isFinite(siteId)) {
      setLoadingWorkers(false);
      setWorkersError('Missing site context — open this screen from the task page.');
      return;
    }
    try {
      const list = await fetchWorkersForSite(siteId);
      setWorkers(list);
      setWorkersError(null);
    } catch {
      setWorkersError('Failed to load workers.');
    } finally {
      setLoadingWorkers(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkers();
  }, [loadWorkers, taskId]);

  const updateField = useCallback((field: keyof SubtaskFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleWorker = useCallback((id: number) => {
    setSelectedWorkers((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }, []);

  const filteredWorkers = useMemo(() => {
    const q = workerSearch.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter((w) => getWorkerName(w).toLowerCase().includes(q));
  }, [workers, workerSearch]);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setError('Subtask name is required'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await createSubtask({
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        task_id:     taskId,
        worker_ids:  selectedWorkers,
      });
      router.push(ROUTES.quality.taskDetail(siteId, taskId));
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create subtask'));
      setSubmitting(false);
    }
  }, [form, taskId, selectedWorkers, router, siteId]);

  const goBack = useCallback(
    () => router.push(ROUTES.quality.taskDetail(siteId, taskId)),
    [router, siteId, taskId]
  );

  return {
    taskId,
    form,
    updateField,
    workers,
    filteredWorkers,
    loadingWorkers,
    workersError,
    selectedWorkers,
    toggleWorker,
    workerSearch,
    setWorkerSearch,
    submitting,
    error,
    handleSubmit,
    goBack,
  };
}