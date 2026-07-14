"use client";

import { useCreateTaskState } from "./useCreateTaskState";
import { useCreateTaskLogic } from "./useCreateTaskLogic";

export function useCreateTask() {
  const state = useCreateTaskState();
  const actions = useCreateTaskLogic(state);

  return { ...state, ...actions };
}