"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { setSites as setSitesCache, getAllSites, sitesLoaded, type Site } from "@/lib/sites-cache";
import { setTaskHandoff } from "@/lib/task-handoff";
import type { Task } from "@/lib/types";
import {
  fetchTasksForSite,
  fetchSites,
  getCachedTasks,
  setCachedTasks,
} from "@/lib/api/tasks-service";
import type { TasksState } from "./useTasksState";

export function useTasksLogic(state: TasksState) {
  const router = useRouter();
  const {
    setTasks,
    setSites,
    selectedSite,
    setSelectedSite,
    setDropdownOpen,
    setLoadingTasks,
    setLoadingSites,
    setError,
    setOffline,
    setRetryInfo,
  } = state;

  const loadTasks = useCallback(
    async (site: Site) => {
      const cached = getCachedTasks(site.id);
      if (cached) {
        setTasks(cached);
        setLoadingTasks(false);
        setOffline(false);
      } else {
        setLoadingTasks(true);
      }

      setError(null);
      setRetryInfo(null);

      try {
        const list = await fetchTasksForSite(site.id, {
          onRetry: (attempt, max) => setRetryInfo({ attempt, max }),
        });
        setCachedTasks(site.id, list);
        setTasks(list);
        setOffline(false);
      } catch {
        if (!cached) {
          setError("Failed to load tasks.");
        } else {
          setOffline(true);
        }
      } finally {
        setLoadingTasks(false);
        setRetryInfo(null);
      }
    },
    [setTasks, setLoadingTasks, setOffline, setError, setRetryInfo]
  );

  useEffect(() => {
    if (sitesLoaded()) {
      const list = getAllSites();
      setSites(list);
      if (list.length > 0) {
        setSelectedSite(list[0]);
        loadTasks(list[0]);
      }
      setLoadingSites(false);
      return;
    }

    fetchSites()
      .then((list) => {
        setSitesCache(list); // populate the module-level sites cache, keyed by id
        setSites(list);
        if (list.length > 0) {
          setSelectedSite(list[0]);
          loadTasks(list[0]);
        }
      })
      .catch(() => setError("Failed to load sites."))
      .finally(() => setLoadingSites(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTasks]);

  const selectSite = useCallback(
    (site: Site) => {
      setSelectedSite(site);
      setDropdownOpen(false);
      loadTasks(site);
    },
    [loadTasks, setSelectedSite, setDropdownOpen]
  );

  const openTask = useCallback(
    (task: Task) => {
      setTaskHandoff(task);
      router.push(`/quality/dashboard/tasks/${task.id}?site_id=${task.site_id}`);
    },
    [router]
  );

  const goToCreateTask = useCallback(() => {
    router.push(
      selectedSite
        ? `/quality/dashboard/tasks/create?site_id=${selectedSite.id}`
        : "/quality/dashboard/tasks/create"
    );
  }, [router, selectedSite]);

  const retry = useCallback(() => {
    if (selectedSite) loadTasks(selectedSite);
  }, [selectedSite, loadTasks]);

  return { selectSite, openTask, goToCreateTask, retry };
}