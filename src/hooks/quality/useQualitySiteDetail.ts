'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { setTaskHandoff } from '@/lib/task-handoff';
import { getSite } from '@/lib/sites-cache';
import { ROUTES } from '@/lib/routes';
import type { Task } from '@/lib/types';
import { fetchSiteDetail, fetchSiteTasks, updateSiteEstimatedValue, SiteDetail } from '@/lib/api/quality';

export function useQualitySiteDetail() {
  const router = useRouter();
  const params = useParams();
  const siteId = Number(params.siteId);
  const cachedSite = getSite(siteId);

  const [site, setSite]             = useState<SiteDetail | null>(null);
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loadingSite, setLoadingSite] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const loadSite = useCallback(async () => {
    setLoadingSite(true);
    setError(null);
    try {
      const full = await fetchSiteDetail(siteId);
      setSite(full);
    } catch {
      setError('Failed to load site.');
    } finally {
      setLoadingSite(false);
    }
  }, [siteId]);

  const loadTasks = useCallback(async () => {
    setTasksError(null);
    setLoadingTasks(true);
    try {
      const list = await fetchSiteTasks(siteId);
      setTasks(list);
    } catch {
      setTasksError('Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSite();
    loadTasks();
  }, [siteId, loadSite, loadTasks]);

  const openTask = useCallback(
    (task: Task) => {
      setTaskHandoff(task);
      router.push(ROUTES.quality.taskDetail(siteId, task.id));
    },
    [router, siteId]
  );

  const goToCreateTask = useCallback(
    () => router.push(ROUTES.quality.taskCreate(siteId)),
    [router, siteId]
  );

  const goBack = useCallback(() => router.push(ROUTES.quality.dashboard), [router]);

  const updateEstimatedValue = useCallback(
    async (newValue: number) => {
      const updated = await updateSiteEstimatedValue(siteId, newValue);
      setSite(updated);
    },
    [siteId]
  );

  return {
    siteId,
    site,
    cachedSite,
    tasks,
    loadingSite,
    loadingTasks,
    error,
    tasksError,
    loadSite,
    loadTasks,
    openTask,
    goToCreateTask,
    goBack,
    updateEstimatedValue,
  };
}