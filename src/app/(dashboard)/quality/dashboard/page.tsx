"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cacheGet, cacheSet, cacheBust } from "@/lib/persistent-cache";
import { setSites, getAllSites, sitesLoaded, type Site } from "@/lib/sites-cache";
import { setTaskHandoff } from "@/lib/task-handoff";
import { withRetry } from "@/lib/retry";
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

function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const arr = d?.items ?? d?.data ?? d?.tasks ?? d?.sites ?? data;
  return Array.isArray(arr) ? arr : [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
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

//Cache

export function bustTaskCache(siteId?: string | number) {
  if (siteId !== undefined) cacheBust(`tasks:${siteId}`);
  else cacheBust("tasks:");
}



export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks]               = useState<Task[]>([]);
  const [sites, setSitesState]          = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [offline, setOffline]           = useState(false);
  const [retryInfo, setRetryInfo]       = useState<{ attempt: number; max: number } | null>(null);

  // ── Loads tasks for a site and retries 3 times in 5secs to fetch 
  const loadTasks = useCallback(async (site: Site) => {
    const cacheKey = `tasks:${site.id}`;

    const cached = cacheGet<Task[]>(cacheKey);
    if (cached) {
      setTasks(cached);
      setLoadingTasks(false);
      setOffline(false);
    } else {
      setLoadingTasks(true);
    }

    setError(null);
    setRetryInfo(null);

    try {
      const list = await withRetry(
        async () => {
          const res = await api.get(`/tasks/list/${site.id}`);
          return parseList<Task>(res.data?.data ?? res.data);
        },
        {
          retries: 3,
          delayMs: 5000,
          onRetry: (attempt, max) => setRetryInfo({ attempt, max }),
        }
      );
      cacheSet(cacheKey, list);
      setTasks(list);
      setOffline(false);
    } catch {
      if (!cached) {
        setError("Failed to load tasks.");
      } else {
        setOffline(true);
      }
    } finally {
      setLoadingTasks(false);
      setRetryInfo(null);
    }
  }, []);

  //Load sites into the hash map
  useEffect(() => {
      if (sitesLoaded()) {
      const list = getAllSites();
      setSitesState(list);
      if (list.length > 0) {
        setSelectedSite(list[0]);
        loadTasks(list[0]);
      }
      setLoadingSites(false);
      return;
    }

    api.get("/sites/list")
      .then((res) => {
        const list = parseList<Site>(res.data?.data ?? res.data);
        setSites(list); // populate the module-level hash map, keyed by id
        setSitesState(list);
        if (list.length > 0) {
          setSelectedSite(list[0]);
          loadTasks(list[0]);
        }
      })
      .catch(() => setError("Failed to load sites."))
      .finally(() => setLoadingSites(false));
  }, [loadTasks]);


  function selectSite(site: Site) {
    setSelectedSite(site);
    setDropdownOpen(false);
    loadTasks(site);
  }


  function openTask(task: Task) {
    setTaskHandoff(task);
    router.push(`/quality/dashboard/tasks/${task.id}?site_id=${task.site_id}`);
  }

 
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
        <button
          onClick={() =>
            router.push(
              selectedSite
                ? `/quality/dashboard/tasks/create?site_id=${selectedSite.id}`
                : "/quality/dashboard/tasks/create"
            )
          }
          className="gv-btn-brand gap-2 text-sm"
        >
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
            onClick={() => setDropdownOpen((o) => !o)}
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
                onClick={() => loadTasks(selectedSite)}
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
              onClick={() => router.push(`/quality/dashboard/tasks/create?site_id=${selectedSite.id}`)}
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
            {tasks.map((task, idx) => {
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