"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import type { Worker } from "@/lib/types";
import {
  ArrowLeft, Loader2, AlertCircle, Users, Search, Check, UserCircle2,
} from "lucide-react";

interface FormState {
  name: string;
  description: string;
}

function parseWorkers(data: unknown): Worker[] {
  if (!data) return [];
  const arr =
    (data as Record<string, unknown>)?.items ??
    (data as Record<string, unknown>)?.data ??
    (data as Record<string, unknown>)?.workers ??
    data;
  return Array.isArray(arr) ? arr : [];
}

export default function CreateSubtaskPage() {
  const params       = useParams();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const taskId         = Number(params?.id);
  const siteIdParam    = searchParams.get("site_id");
  const siteId         = siteIdParam ? Number(siteIdParam) : null;

  const [form, setForm]                 = useState<FormState>({ name: "", description: "" });
  const [workers, setWorkers]            = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workersError, setWorkersError]  = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [workerSearch, setWorkerSearch]  = useState("");
  const [submitting, setSubmitting]      = useState(false);
  const [error, setError]                = useState<string | null>(null);

 
  const loadWorkers = useCallback(async () => {
    if (siteId === null) {
      setLoadingWorkers(false);
      setWorkersError("Missing site context — open this screen from the task page.");
      return;
    }
    try {
      const res = await api.get(`/workers/list-by-id/${siteId}`);
      setWorkers(parseWorkers(res.data?.data ?? res.data));
      setWorkersError(null);
    } catch {
      setWorkersError("Failed to load workers.");
    } finally {
      setLoadingWorkers(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    loadWorkers();
  }, [loadWorkers, taskId]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function toggleWorker(id: number) {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Subtask name is required"); return; }

    setSubmitting(true);
    setError(null);
    try {
        await api.post("/tasks/sub-task/create", {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        task_id:     taskId,
        worker_ids:  selectedWorkers, // [] is valid — DTO defaults to []
      });
      router.back();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e as Error)?.message ??
        "Failed to create subtask";
      setError(msg);
      setSubmitting(false);
    }
  }

  const filtered = workerSearch.trim()
    ? workers.filter((w) => w.name.toLowerCase().includes(workerSearch.toLowerCase()))
    : workers;

  if (!Number.isFinite(taskId)) {
    return (
      <div className="gv-page-dashboard flex items-center justify-center text-sm text-[var(--gv-text-subtle)]">
        Invalid task.
      </div>
    );
  }

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-4 sm:px-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="gv-btn-outline p-2 w-9 h-9 rounded-xl flex-shrink-0">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-[var(--gv-text-primary)] tracking-tight">Create Subtask</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-5">
        {error && (
          <div className="gv-card flex items-center gap-2 text-sm text-red-400 border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="gv-label">Name <span className="text-red-400">*</span></label>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Foundation Inspection"
            className="gv-input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="gv-label">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Details about this subtask…"
            rows={3}
            className="gv-input resize-none"
          />
        </div>

        {/* Assign Workers */}
        <div>
          <label className="gv-label flex items-center gap-1.5">
            <Users size={12} />
            Assign Workers
            <span className="text-[var(--gv-text-faint)] normal-case tracking-normal font-normal">(optional)</span>
          </label>

          <div className="gv-card overflow-hidden p-0">
            {/* Search bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--gv-glass-border)]">
              <Search size={14} className="text-[var(--gv-text-faint)] flex-shrink-0" />
              <input
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Search workers…"
                className="flex-1 bg-transparent text-sm text-[var(--gv-text-primary)] placeholder-[var(--gv-text-faint)] outline-none"
              />
              {selectedWorkers.length > 0 && (
                <span className="text-xs text-[var(--gv-brand)] font-medium flex-shrink-0">
                  {selectedWorkers.length} selected
                </span>
              )}
            </div>

            {/* Worker list */}
            <div className="max-h-64 overflow-y-auto">
              {loadingWorkers ? (
                <div className="flex items-center justify-center py-10 text-[var(--gv-text-subtle)] gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading workers…
                </div>
              ) : workersError ? (
                <div className="flex flex-col items-center justify-center py-10 text-red-400 gap-2 text-sm px-4 text-center">
                  <AlertCircle size={20} />
                  {workersError}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[var(--gv-text-faint)] gap-2 text-sm">
                  <UserCircle2 size={28} strokeWidth={1} />
                  {workerSearch ? "No workers match" : "No workers found for this site"}
                </div>
              ) : (
                filtered.map((worker) => {
                  const selected = selectedWorkers.includes(worker.id);
                  return (
                    <button
                      key={worker.id}
                      type="button"
                      onClick={() => toggleWorker(worker.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                        selected ? "bg-[var(--gv-brand)]/10" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected
                            ? "bg-[var(--gv-brand)] text-white"
                            : "bg-white/10 text-[var(--gv-text-muted)]"
                        }`}
                      >
                        {selected ? <Check size={14} /> : worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selected ? "text-[var(--gv-brand)]" : "text-[var(--gv-text-primary)]"}`}>
                          {worker.name}
                        </p>
                        {(worker.role || worker.department) && (
                          <p className="text-xs text-[var(--gv-text-faint)] truncate">
                            {[worker.role, worker.department].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                          selected ? "bg-[var(--gv-brand)] border-[var(--gv-brand)]" : "border-[var(--gv-glass-border)]"
                        }`}
                      >
                        {selected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Submit — full width on all breakpoints, wraps content responsively */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim()}
          className="gv-btn-brand w-full py-3.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create Subtask"}
        </button>
      </div>
    </div>
  );
}