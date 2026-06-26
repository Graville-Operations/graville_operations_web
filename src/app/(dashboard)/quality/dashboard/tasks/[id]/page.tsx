"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/persistent-cache";
import { getTaskHandoff } from "@/lib/task-handoff";
import { getSite } from "@/lib/sites-cache";
import { withRetry } from "@/lib/retry";
import type { Task, SubTask } from "@/lib/types";
import {
  ArrowLeft, Plus, CalendarRange, CheckCircle2, Clock,
  AlertCircle, Layers, ChevronRight, Loader2, Users, WifiOff, RefreshCw,
} from "lucide-react";



const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
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
    className: "bg-white/5 text-[var(--gv-text-muted)] border border-[var(--gv-glass-border)]",
  },
};

function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const arr = d?.items ?? d?.data ?? d?.subtasks ?? data;
  return Array.isArray(arr) ? arr : [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}



export default function TaskDetailPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const taskId        = Number(params?.id);
  const siteIdParam   = searchParams.get("site_id");
  const siteId        = siteIdParam ? Number(siteIdParam) : null;


  const [task, setTask]               = useState<Task | null>(null);
  const [taskMissing, setTaskMissing]  = useState(false);
  const [subtasks, setSubtasks]        = useState<SubTask[]>([]);
  const [loadingSubs, setLoadingSubs]  = useState(true);
  const [subsError, setSubsError]      = useState<string | null>(null);
  const [offline, setOffline]          = useState(false);
  const [retryInfo, setRetryInfo]      = useState<{ attempt: number; max: number } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    const handed = getTaskHandoff(taskId);
    if (handed) {
      setTask(handed);
    } else {
      setTaskMissing(true);
    }
  }, [taskId]);

 
  // Auto-retries 3 times
  const loadSubtasks = useCallback(async () => {
    const cacheKey = `subtasks:${taskId}`;

    const cached = cacheGet<SubTask[]>(cacheKey);
    if (cached) {
      setSubtasks(cached);
      setLoadingSubs(false);
    }

    setSubsError(null);
    setRetryInfo(null);

    try {
      const list = await withRetry(
        async () => {
          const res = await api.get(`/tasks/sub-task/list/${taskId}`);
          return parseList<SubTask>(res.data?.data ?? res.data);
        },
        {
          retries: 3,
          delayMs: 5000,
          onRetry: (attempt, max) => setRetryInfo({ attempt, max }),
        }
      );
      cacheSet(cacheKey, list);
      setSubtasks(list);
      setOffline(false);
    } catch {
      if (cached) {
        setOffline(true);
      } else {
        setSubsError("Failed to load subtasks.");
      }
    } finally {
      setLoadingSubs(false);
      setRetryInfo(null);
    }
  }, [taskId]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    loadSubtasks();
  }, [taskId, loadSubtasks]);

  
  const resolvedSiteId = task?.site_id ?? siteId ?? undefined;
  const site = resolvedSiteId !== undefined ? getSite(resolvedSiteId) : undefined;

  function goToCreateSubtask() {
    const sid = resolvedSiteId;
    router.push(
      sid !== undefined
        ? `/quality/dashboard/tasks/${taskId}/subtasks/create?site_id=${sid}`
        : `/quality/dashboard/tasks/${taskId}/subtasks/create`
    );
  }

  if (!Number.isFinite(taskId)) {
    return (
      <div className="gv-page-dashboard flex items-center justify-center text-sm text-[var(--gv-text-subtle)]">
        Invalid task.
      </div>
    );
  }

 
  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-4 sm:px-6 flex items-center gap-3 flex-wrap">
        <button onClick={() => router.back()} className="gv-btn-outline p-2 w-9 h-9 rounded-xl flex-shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[var(--gv-text-primary)] tracking-tight truncate">
            {task?.name ?? (taskMissing ? "Task" : "Loading…")}
          </h1>
          {site && <p className="gv-eyebrow mt-0.5">{site.name}</p>}
        </div>
        <button
          onClick={goToCreateSubtask}
          className="gv-btn-brand gap-2 text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Add Subtask
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">

        {offline && (
          <div className="gv-card flex items-center gap-3 text-sm text-amber-400 border-amber-500/20 bg-amber-500/10 p-3">
            <WifiOff size={15} className="flex-shrink-0" />
            You&apos;re offline — showing cached subtasks.
          </div>
        )}

        {taskMissing && (
          <div className="gv-card flex items-center gap-3 text-sm text-red-400 border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={16} className="flex-shrink-0" />
            Task details aren&apos;t available — open this task from the Tasks list rather than a direct link or reload.
          </div>
        )}

        {task && (
          <div className="gv-card p-5 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {(() => {
                const s = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
                return (
                  <span className={`gv-tag flex items-center gap-1 ${s.className}`}>
                    {s.icon} {s.label}
                  </span>
                );
              })()}
              <span className="flex items-center gap-1.5 text-xs text-[var(--gv-text-subtle)]">
                <CalendarRange size={12} className="text-[var(--gv-brand)]" />
                {formatDate(task.start_date)} → {formatDate(task.end_date)}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-[var(--gv-text-muted)] leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        )}

        {/* Subtasks section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--gv-text-primary)] flex items-center gap-2">
              <Layers size={14} className="text-[var(--gv-brand)]" />
              Subtasks
              {subtasks.length > 0 && (
                <span className="text-xs text-[var(--gv-text-subtle)] font-normal">· {subtasks.length}</span>
              )}
            </h2>
          </div>

          {retryInfo && (
            <div className="gv-card flex items-center gap-3 text-sm text-[var(--gv-text-muted)] p-3 mb-2">
              <RefreshCw size={15} className="flex-shrink-0 animate-spin" />
              <span>Retrying… ({retryInfo.attempt}/{retryInfo.max})</span>
            </div>
          )}

          {subsError && subtasks.length === 0 && (
            <div className="gv-card flex items-center gap-3 text-sm text-red-400 border-red-500/20 bg-red-500/10 p-3 mb-2">
              <AlertCircle size={16} className="flex-shrink-0" /> {subsError}
              <button onClick={loadSubtasks} className="ml-auto underline underline-offset-2 hover:text-red-300 flex-shrink-0">
                Retry
              </button>
            </div>
          )}

          {loadingSubs && subtasks.length === 0 && !subsError && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-[var(--gv-glass-bg)] animate-pulse" />
              ))}
            </div>
          )}

          {loadingSubs && subtasks.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--gv-text-subtle)] mb-2">
              <Loader2 size={12} className="animate-spin" /> Refreshing…
            </div>
          )}

          {!loadingSubs && !subsError && subtasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--gv-text-subtle)]">
              <Layers size={36} strokeWidth={1} />
              <p className="text-sm">No subtasks yet</p>
              <button
                onClick={goToCreateSubtask}
                className="text-sm text-[var(--gv-brand)] hover:text-[var(--gv-brand-hover)] underline underline-offset-2"
              >
                Add first subtask
              </button>
            </div>
          )}

          {subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((sub) => {
                const status = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
                const workerCount = sub.assigned_workers?.length ?? 0;
                return (
                  <div key={sub.id} className="gv-card w-full text-left flex items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--gv-brand)] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--gv-text-primary)] truncate">{sub.name}</p>
                      {sub.description && (
                        <p className="text-xs text-[var(--gv-text-subtle)] truncate mt-0.5">{sub.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-[var(--gv-text-subtle)]">
                          {sub.completion_percentage}% complete
                        </span>
                        {workerCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-[var(--gv-text-subtle)]">
                            <Users size={11} />
                            {workerCount} worker{workerCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`gv-tag flex items-center gap-1 ${status.className}`}>
                        {status.icon} {status.label}
                      </span>
                      <ChevronRight size={14} className="text-[var(--gv-text-faint)]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}