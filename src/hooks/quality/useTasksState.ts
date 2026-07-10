"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import type { Site } from "@/lib/sites-cache";

export interface RetryInfo {
  attempt: number;
  max: number;
}

export function useTasksState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [retryInfo, setRetryInfo] = useState<RetryInfo | null>(null);

  return {
    tasks, setTasks,
    sites, setSites,
    selectedSite, setSelectedSite,
    dropdownOpen, setDropdownOpen,
    loadingTasks, setLoadingTasks,
    loadingSites, setLoadingSites,
    error, setError,
    offline, setOffline,
    retryInfo, setRetryInfo,
  };
}

export type TasksState = ReturnType<typeof useTasksState>;