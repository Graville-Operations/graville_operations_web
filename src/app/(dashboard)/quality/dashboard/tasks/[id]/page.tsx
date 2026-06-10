"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  CalendarRange,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Layers,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: "pending" | "in_progress" | "completed";
}

interface Subtask {
  id: number;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  completion_percentage?: number;
  worker_count?: number;
  workers?: { id: number; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    dotClass: "bg-blue-400",
  },
  pending: {
    label: "Pending",
    className: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    dotClass: "bg-slate-400",
  },
};

function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const arr =
    (data as Record<string, unknown>)?.items ??
    (data as Record<string, unknown>)?.data ??
    (data as Record<string, unknown>)?.subtasks ??
    data;
  return Array.isArray(arr) ? arr : [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.id);

  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loadingTask, setLoadingTask] = useState(true);
  const [loadingSubtasks, setLoadingSubtasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!Number.isFinite(taskId)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center text-sm text-white/40">
        Invalid task
      </div>
    );
  }

  // ── Phase 1: task details ──────────────────────────────────────────────────
  const loadTask = useCallback(async (cancelled: { v: boolean }) => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      if (cancelled.v) return;
      const t = res.data?.data ?? res.data;
      setTask(t);
    } catch {
      if (!cancelled.v) setError("Failed to load task");
    } finally {
      if (!cancelled.v) setLoadingTask(false);
    }
  }, [taskId]);

  // ── Phase 2: subtasks ──────────────────────────────────────────────────────
  const loadSubtasks = useCallback(async (cancelled: { v: boolean }) => {
    try {
      const res = await api.get(`/tasks/${taskId}/subtasks`);
      if (cancelled.v) return;
      setSubtasks(parseList<Subtask>(res.data?.data ?? res.data));
    } catch {
      // non-fatal
    } finally {
      if (!cancelled.v) setLoadingSubtasks(false);
    }
  }, [taskId]);

  useEffect(() => {
    const cancelled = { v: false };
    loadTask(cancelled);
    loadSubtasks(cancelled);
    return () => { cancelled.v = true; };
  }, [loadTask, loadSubtasks]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const status = STATUS_CONFIG[task?.status ?? "pending"] ?? STATUS_CONFIG.pending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/50 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            {loadingTask ? (
              <div className="h-5 w-40 rounded-lg bg-white/10 animate-pulse" />
            ) : (
              <h1 className="text-xl font-bold tracking-tight truncate">
                {task?.name ?? "Task"}
              </h1>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 flex items-center gap-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Task meta card */}
        {!loadingTask && task && (
          <div className="gv-card rounded-2xl border border-white/8 bg-white/[0.04] p-5 space-y-4">
            {/* Status + date row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
              {(task.start_date || task.end_date) && (
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <CalendarRange size={12} />
                  {formatDate(task.start_date)} → {formatDate(task.end_date)}
                </span>
              )}
            </div>
            {/* Description */}
            {task.description && (
              <p className="text-sm text-white/50 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        )}
        {loadingTask && (
          <div className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        )}

        {/* Subtasks section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
              Subtasks
              {!loadingSubtasks && (
                <span className="ml-2 text-white/30 normal-case tracking-normal font-normal">
                  ({subtasks.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => router.push(`/quality/dashboard/tasks/${taskId}/subtasks/create`)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Plus size={13} />
              Add Subtask
            </button>
          </div>

          {/* Subtask loading */}
          {loadingSubtasks && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {/* Subtask empty */}
          {!loadingSubtasks && subtasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/25 rounded-2xl border border-white/5 border-dashed">
              <Layers size={32} strokeWidth={1} />
              <p className="text-sm">No subtasks yet</p>
            </div>
          )}

          {/* Subtask list */}
          {!loadingSubtasks && subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((sub) => {
                const st =
                  STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
                const pct = sub.completion_percentage ?? 0;
                const workers =
                  sub.worker_count ??
                  sub.workers?.length ??
                  0;

                return (
                  <div
                    key={sub.id}
                    className="gv-card rounded-2xl border border-white/8 bg-white/[0.04] p-4 space-y-3 hover:bg-white/[0.06] transition-colors"
                  >
                    {/* Name + status */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-sm text-white truncate">
                        {sub.name}
                      </p>
                      <span
                        className={`flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${st.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                        {st.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/35">
                        <span className="flex items-center gap-1">
                          <BarChart3 size={11} />
                          {pct}% complete
                        </span>
                        {workers > 0 && (
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {workers} worker{workers !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push(`/quality/dashboard/tasks/${taskId}/subtasks/create`)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 flex items-center justify-center shadow-xl shadow-blue-900/40 transition-colors"
        title="Add subtask"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}