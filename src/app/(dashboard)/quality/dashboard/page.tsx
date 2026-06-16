"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Plus, CalendarRange, CheckCircle2, Clock, AlertCircle, ChevronRight, Layers } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: "pending" | "in_progress" | "completed";
  subtask_count?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 size={12} />,
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  in_progress: {
    label: "In Progress",
    icon: <AlertCircle size={12} />,
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
  pending: {
    label: "Pending",
    icon: <Clock size={12} />,
    className: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  },
};

function parseTaskList(data: unknown): Task[] {
  if (!data) return [];
  const arr =
    (data as Record<string, unknown>)?.items ??
    (data as Record<string, unknown>)?.data ??
    (data as Record<string, unknown>)?.tasks ??
    data;
  return Array.isArray(arr) ? arr : [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ACCENT_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-fuchsia-500 to-purple-500",
];

// ─── Module-level cache ────────────────────────────────────────────────────────

let _taskCache: Task[] | null = null;
let _taskCacheTime = 0;
const CACHE_TTL = 60_000;

export function bustTaskCache() {
  _taskCache = null;
  _taskCacheTime = 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const now = Date.now();
    if (_taskCache && now - _taskCacheTime < CACHE_TTL) {
      setTasks(_taskCache);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/tasks/list");
      const list = parseTaskList(res.data?.data ?? res.data);
      _taskCache = list;
      _taskCacheTime = Date.now();
      setTasks(list);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tasks</h1>
            <p className="text-xs text-white/40 mt-0.5">
              {loading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => router.push("/quality/dashboard/tasks/create")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 flex items-center gap-3">
            <AlertCircle size={16} />
            {error}
            <button
              onClick={load}
              className="ml-auto underline underline-offset-2 hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/30">
            <Layers size={40} strokeWidth={1} />
            <p className="text-sm">No tasks yet</p>
            <button
              onClick={() => router.push("/quality/dashboard/tasks/create")}
              className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Create your first task
            </button>
          </div>
        )}

        {/* Task cards */}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];

              return (
                <button
                  key={task.id}
                  onClick={() => router.push(`quality/dashboard/tasks/${task.id}`)}
                  className="gv-card w-full text-left group hover:border-white/15 transition-all duration-200 hover:bg-white/[0.06] flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/[0.04]"
                >
                  {/* Accent avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                  >
                    {task.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {(task.start_date || task.end_date) && (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <CalendarRange size={11} />
                          {formatDate(task.start_date)} → {formatDate(task.end_date)}
                        </span>
                      )}
                      {task.subtask_count !== undefined && task.subtask_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Layers size={11} />
                          {task.subtask_count} subtask{task.subtask_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-white/20 group-hover:text-white/50 transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}