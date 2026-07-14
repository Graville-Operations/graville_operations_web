"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchWorkersBySite,
  createSubtask,
  extractErrorMessage,
} from "@/lib/api/tasks-service";
import type { Worker } from "@/lib/types";
import type { CreateSubtaskState } from "./useCreateSubtaskState";

export function useCreateSubtaskLogic(state: CreateSubtaskState) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const taskId = Number(params?.id);
  const siteIdParam = searchParams.get("site_id");
  const siteId = siteIdParam ? Number(siteIdParam) : null;

  const {
    form,
    setForm,
    setWorkers,
    setLoadingWorkers,
    setWorkersError,
    selectedWorkers,
    setSelectedWorkers,
    workerSearch,
    setSubmitting,
    setError,
  } = state;

  const loadWorkers = useCallback(async () => {
    if (siteId === null) {
      setLoadingWorkers(false);
      setWorkersError("Missing site context — open this screen from the task page.");
      return;
    }
    try {
      const list = await fetchWorkersBySite(siteId);
      setWorkers(list);
      setWorkersError(null);
    } catch {
      setWorkersError("Failed to load workers.");
    } finally {
      setLoadingWorkers(false);
    }
  }, [siteId, setWorkers, setLoadingWorkers, setWorkersError]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    loadWorkers();
  }, [loadWorkers, taskId]);

  const setField = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [setForm]
  );

  const toggleWorker = useCallback(
    (id: number) => {
      setSelectedWorkers((prev) =>
        prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
      );
    },
    [setSelectedWorkers]
  );

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setError("Subtask name is required"); return; }

    setSubmitting(true);
    setError(null);
    try {
      await createSubtask({
        name: form.name.trim(),
        description: form.description.trim(),
        task_id: taskId,
        worker_ids: selectedWorkers,
      });
      router.back();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to create subtask"));
      setSubmitting(false);
    }
  }, [form, taskId, selectedWorkers, router, setSubmitting, setError]);

  const filterWorkers = useCallback(
    (workers: Worker[]): Worker[] =>
      workerSearch.trim()
        ? workers.filter((w) => w.name.toLowerCase().includes(workerSearch.toLowerCase()))
        : workers,
    [workerSearch]
  );

  return { taskId, setField, toggleWorker, handleSubmit, filterWorkers, loadWorkers };
}