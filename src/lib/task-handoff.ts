import type { Task } from "./types";

const PREFIX = "task-handoff:";

export function setTaskHandoff(task: Task): void {
  try {
    sessionStorage.setItem(`${PREFIX}${task.id}`, JSON.stringify(task));
  } catch {
   }
}

export function getTaskHandoff(taskId: number): Task | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${taskId}`);
    return raw ? (JSON.parse(raw) as Task) : null;
  } catch {
    return null;
  }
}