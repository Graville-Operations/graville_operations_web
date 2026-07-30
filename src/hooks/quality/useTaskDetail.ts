'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cacheGet, cacheSet } from '@/lib/persistent-cache';
import { getTaskHandoff } from '@/lib/task-handoff';
import { getSite } from '@/lib/sites-cache';
import type { Task, SubTask } from '@/lib/types';
import { fetchSubtasks } from '@/lib/api/quality';
import { ROUTES } from '@/lib/routes';

export function useTaskDetail() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.id);
  const siteIdParam = Number(params?.siteId);

  const [task, setTask]               = useState<Task | null>(null);
  const [taskMissing, setTaskMissing] = useState(false);
  const [subtasks, setSubtasks]       = useState<SubTask[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subsError, setSubsError]     = useState<string | null>(null);
  const [offline, setOffline]         = useState(false);
  const [retryInfo, setRetryInfo]     = useState<{ attempt: number; max: number } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    const handed = getTaskHandoff(taskId);
    if (handed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTask(handed);
    } else {
      setTaskMissing(true);
    }
  }, [taskId]);

  const loadSubtasks = useCallback(async () => {
    const cacheKey = `subtasks:${taskId}`;

    const cached = cacheGet<SubTask[]>(cacheKey);
    if (cached) {
      setSubtasks(cached);
      setLoadingSubs(false);
    }

    setSubsError(null);
    setRetryInfo(null);

    try {
      const list = await fetchSubtasks(taskId, (attempt, max) => setRetryInfo({ attempt, max }));
      cacheSet(cacheKey, list);
      setSubtasks(list);
      setOffline(false);
    } catch {
      if (cached) {
        setOffline(true);
      } else {
        setSubsError('Failed to load subtasks.');
      }
    } finally {
      setLoadingSubs(false);
      setRetryInfo(null);
    }
  }, [taskId]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubtasks();
  }, [taskId, loadSubtasks]);

  const resolvedSiteId = Number.isFinite(siteIdParam) ? siteIdParam : task?.site_id;
  const site = resolvedSiteId !== undefined ? getSite(resolvedSiteId) : undefined;

  const goToCreateSubtask = useCallback(() => {
    if (resolvedSiteId === undefined) return;
    router.push(ROUTES.quality.subtaskCreate(resolvedSiteId, taskId));
  }, [router, resolvedSiteId, taskId]);

  const goBack = useCallback(() => {
    if (resolvedSiteId === undefined) return;
    router.push(ROUTES.quality.siteDetail(resolvedSiteId));
  }, [router, resolvedSiteId]);

  return {
    taskId,
    task,
    taskMissing,
    site,
    subtasks,
    loadingSubs,
    subsError,
    offline,
    retryInfo,
    loadSubtasks,
    goToCreateSubtask,
    goBack,
  };
}