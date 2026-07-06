"use client";

import { useState } from "react";
import type { Task, SubTask } from "@/lib/types";

export interface RetryInfo {
  attempt: number;
  max: number;
}

export function useTaskDetailState() {
  const [task, setTask] = useState<Task | null>(null);
  const [taskMissing, setTaskMissing] = useState(false);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [retryInfo, setRetryInfo] = useState<RetryInfo | null>(null);

  return {
    task, setTask,
    taskMissing, setTaskMissing,
    subtasks, setSubtasks,
    loadingSubs, setLoadingSubs,
    subsError, setSubsError,
    offline, setOffline,
    retryInfo, setRetryInfo,
  };
}

export type TaskDetailState = ReturnType<typeof useTaskDetailState>;