"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getTaskHandoff } from "@/lib/task-handoff";
import { getSite } from "@/lib/sites-cache";
import {
  fetchSubtasksForTask,
  getCachedSubtasks,
  setCachedSubtasks,
} from "@/lib/api/tasks-service";
import type { TaskDetailState } from "./useTaskDetailState";
import { ROUTES } from "@/lib/routes";

export function useTaskDetailLogic(state: TaskDetailState) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const taskId = Number(params?.id);
  const siteIdParam = searchParams.get("site_id");
  const siteId = siteIdParam ? Number(siteIdParam) : null;

  const {
    task,
    setTask,
    setTaskMissing,
    setSubtasks,
    setLoadingSubs,
    setSubsError,
    setOffline,
    setRetryInfo,
  } = state;

  // ── Resolve task from the in-memory handoff cache ───────────────────
  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    const handed = getTaskHandoff(taskId);
    if (handed) {
      setTask(handed);
    } else {
      setTaskMissing(true);
    }
  }, [taskId, setTask, setTaskMissing]);

  const loadSubtasks = useCallback(async () => {
    const cached = getCachedSubtasks(taskId);
    if (cached) {
      setSubtasks(cached);
      setLoadingSubs(false);
    }

    setSubsError(null);
    setRetryInfo(null);

    try {
      const list = await fetchSubtasksForTask(taskId, {
        onRetry: (attempt, max) => setRetryInfo({ attempt, max }),
      });
      setCachedSubtasks(taskId, list);
      setSubtasks(list);
      setOffline(false);
    } catch {
      if (cached) {
        setOffline(true);
      } else {
        setSubsError("Failed to load subtasks.");
      }
    } finally {
      setLoadingSubs(false);
      setRetryInfo(null);
    }
  }, [taskId, setSubtasks, setLoadingSubs, setSubsError, setOffline, setRetryInfo]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    loadSubtasks();
  }, [taskId, loadSubtasks]);

  const resolvedSiteId = task?.site_id ?? siteId ?? undefined;
  const site = resolvedSiteId !== undefined ? getSite(resolvedSiteId) : undefined;

  const goToCreateSubtask = useCallback(() => {
    router.push(
      resolvedSiteId !== undefined
        ? `${ROUTES.quality.subtaskCreate(String(taskId))}?site_id=${resolvedSiteId}`
        : ROUTES.quality.subtaskCreate(String(taskId))
    );
  }, [router, taskId, resolvedSiteId]);

  return { taskId, site, loadSubtasks, goToCreateSubtask };
}