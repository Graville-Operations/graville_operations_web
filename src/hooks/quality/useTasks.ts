"use client";

import { useTasksState } from "./useTasksState";
import { useTasksLogic } from "./useTasksLogic";

export function useTasks() {
  const state = useTasksState();
  const actions = useTasksLogic(state);

  return { ...state, ...actions };
}