"use client";

import { useCreateSubtaskState } from "./useCreateSubtaskState";
import { useCreateSubtaskLogic } from "./useCreateSubtaskLogic";

export function useCreateSubtask() {
  const state = useCreateSubtaskState();
  const actions = useCreateSubtaskLogic(state);

  return { ...state, ...actions };
}