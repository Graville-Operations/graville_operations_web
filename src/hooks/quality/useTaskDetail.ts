"use client";

import { useTaskDetailState } from "./useTaskDetailState";
import { useTaskDetailLogic } from "./useTaskDetailLogic";

export function useTaskDetail() {
  const state = useTaskDetailState();
  const derived = useTaskDetailLogic(state);

  return { ...state, ...derived };
}