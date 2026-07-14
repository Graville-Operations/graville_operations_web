'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { setTaskHandoff } from '@/lib/task-handoff';
import type { Task } from '@/lib/types';
import { fetchSiteDetail, fetchSiteTasks, SiteDetail } from '@/lib/api/quality';

export function useQualitySiteDetail() {
  const router = useRouter();
  const params = useParams();
  const siteId = Number(params.siteId);

  const [site, setSite]                 = useState<SiteDetail | null>(null);
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loadingSite, setLoadingSite]   = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [offline, setOffline]           = useState(false);
  const [retryInfo, setRetryInfo]       = useState<{ attempt: number; max: number } | null>(null);

  const loadSite = useCallback(async () => {
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
    setRetryInfo(null);
    try {
      const list = await fetchSiteTasks(siteId, (attempt, max) => setRetryInfo({ attempt, max }));
      setTasks(list);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoadingTasks(false);
      setRetryInfo(null);
    }
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    loadSite();
    loadTasks();
  }, [siteId, loadSite, loadTasks]);

  const openTask = useCallback(
    (task: Task) => {
      setTaskHandoff(task);
      router.push(`/quality/dashboard/${siteId}/tasks/${task.id}`);
    },
    [router, siteId]
  );

  const goToCreateTask = useCallback(
    () => router.push(`/quality/dashboard/${siteId}/tasks/create`),
    [router, siteId]
  );

  const goBack = useCallback(() => router.push('/quality/dashboard'), [router]);

  return {
    siteId,
    site,
    tasks,
    loadingSite,
    loadingTasks,
    error,
    offline,
    retryInfo,
    loadSite,
    loadTasks,
    openTask,
    goToCreateTask,
    goBack,
  };
}