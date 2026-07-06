"use client";

import { useTasks } from "@/hooks/quality/useTasks";
import type { Task } from "@/lib/types";
import {
  Plus, CalendarRange, CheckCircle2, Clock,
  AlertCircle, ChevronRight, Layers, ChevronDown,
  WifiOff, RefreshCw,
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

const ACCENT_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-fuchsia-500 to-purple-500",
];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function TasksPage() {
  const {
    tasks,
    sites,
    selectedSite,
    dropdownOpen,
    loadingTasks,
    loadingSites,
    error,
    offline,
    retryInfo,
    setDropdownOpen,
    selectSite,
    openTask,
    goToCreateTask,
    retry,
  } = useTasks();

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--gv-text-primary)] tracking-tight">Tasks</h1>
          <p className="gv-eyebrow mt-0.5">
            {loadingTasks || loadingSites
              ? "Loading…"
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}${selectedSite ? ` · ${selectedSite.name}` : ""}`}
          </p>
        </div>
        <button onClick={goToCreateTask} className="gv-btn-brand gap-2 text-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-4">
        {offline && (
          <div className="gv-card flex items-center gap-3 text-sm text-amber-400 border-amber-500/20 bg-amber-500/10 p-3">
            <WifiOff size={15} className="flex-shrink-0" />
            <span>You&apos;re offline — showing cached data.</span>
          </div>
        )}

        {/* Site switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={loadingSites}
            className="gv-btn-outline flex items-center gap-2 text-sm min-w-52 disabled:opacity-50"
          >
            <span className="flex-1 text-left truncate">
              {loadingSites ? "Loading sites…" : selectedSite?.name ?? "Select a site"}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 text-[var(--gv-text-subtle)] shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && sites.length > 0 && (
            <div className="gv-dropdown w-64 z-30">
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => selectSite(site)}
                  className={`gv-dropdown-item ${selectedSite?.id === site.id ? "gv-dropdown-item--active" : ""}`}
                >
                  {site.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {retryInfo && (
          <div className="gv-card flex items-center gap-3 text-sm text-[var(--gv-text-muted)] p-3">
            <RefreshCw size={15} className="flex-shrink-0 animate-spin" />
            <span>Retrying… ({retryInfo.attempt}/{retryInfo.max})</span>
          </div>
        )}

        {loadingTasks && tasks.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--gv-glass-bg)] animate-pulse" />
            ))}
          </div>
        )}

        {!loadingTasks && !loadingSites && error && tasks.length === 0 && (
          <div className="gv-card flex items-center gap-3 text-sm text-red-400 border-red-500/20 bg-red-500/10">
            <AlertCircle size={16} /> {error}
            {selectedSite && (
              <button
                onClick={retry}
                className="ml-auto underline underline-offset-2 hover:text-red-300"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!loadingTasks && !loadingSites && !error && tasks.length === 0 && selectedSite && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-[var(--gv-text-subtle)]">
            <Layers size={40} strokeWidth={1} />
            <p className="text-sm">No tasks for {selectedSite.name}</p>
            <button
              onClick={goToCreateTask}
              className="text-sm text-[var(--gv-brand)] hover:text-[var(--gv-brand-hover)] underline underline-offset-2"
            >
              Create first task
            </button>
          </div>
        )}

        {!loadingSites && sites.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-[var(--gv-text-subtle)]">
            <Layers size={40} strokeWidth={1} />
            <p className="text-sm">No sites found. Create a site first.</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task: Task, idx: number) => {
              const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const subtaskCount = task.subtasks?.length ?? 0;
              return (
                <button
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="gv-card gv-card-hover w-full text-left flex items-center gap-4 p-4"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                    {task.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--gv-text-primary)] truncate">{task.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {(task.start_date || task.end_date) && (
                        <span className="flex items-center gap-1 text-xs text-[var(--gv-text-subtle)]">
                          <CalendarRange size={11} />
                          {formatDate(task.start_date)} → {formatDate(task.end_date)}
                        </span>
                      )}
                      {subtaskCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[var(--gv-text-subtle)]">
                          <Layers size={11} />
                          {subtaskCount} subtask{subtaskCount !== 1 ? "s" : ""}
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
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}