"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Search,
  Check,
  UserCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Worker {
  id: number;
  name: string;
  role?: string;
  department?: string;
}

interface FormState {
  name: string;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseWorkers(data: unknown): Worker[] {
  if (!data) return [];
  const arr =
    (data as Record<string, unknown>)?.items ??
    (data as Record<string, unknown>)?.data ??
    (data as Record<string, unknown>)?.workers ??
    data;
  return Array.isArray(arr) ? arr : [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateSubtaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.id);

  const [form, setForm] = useState<FormState>({ name: "", description: "" });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load workers ────────────────────────────────────────────────────────────
  const loadWorkers = useCallback(async () => {
    try {
      const res = await api.get("/workers/list");
      setWorkers(parseWorkers(res.data?.data ?? res.data));
    } catch {
      // non-fatal
    } finally {
      setLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    if (!Number.isFinite(taskId)) return;
    loadWorkers();
  }, [loadWorkers, taskId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function toggleWorker(id: number) {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Subtask name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/tasks/${taskId}/subtasks`, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        worker_ids: selectedWorkers.length > 0 ? selectedWorkers : undefined,
      });
      router.back();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? (e as Error)?.message ?? "Failed to create subtask";
      setError(msg);
      setSubmitting(false);
    }
  }

  // ── Filtered workers ────────────────────────────────────────────────────────
  const filtered = workerSearch.trim()
    ? workers.filter((w) =>
        w.name.toLowerCase().includes(workerSearch.toLowerCase())
      )
    : workers;

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!Number.isFinite(taskId)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center text-sm text-white/40">
        Invalid task
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/50 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Create Subtask</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-5">
        {/* Error banner */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Foundation Inspection"
            className="w-full rounded-2xl bg-white/[0.06] border border-white/8 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Details about this subtask…"
            rows={3}
            className="w-full rounded-2xl bg-white/[0.06] border border-white/8 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
          />
        </div>

        {/* Assign Workers */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={12} />
            Assign Workers
            <span className="text-white/25 normal-case tracking-normal font-normal">
              (optional)
            </span>
          </label>

          <div className="rounded-2xl bg-white/[0.06] border border-white/8 overflow-hidden">
            {/* Search bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
              <Search size={14} className="text-white/30 flex-shrink-0" />
              <input
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Search workers…"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
              {selectedWorkers.length > 0 && (
                <span className="text-xs text-blue-400 font-medium">
                  {selectedWorkers.length} selected
                </span>
              )}
            </div>

            {/* Worker list */}
            <div className="max-h-64 overflow-y-auto">
              {loadingWorkers ? (
                <div className="flex items-center justify-center py-10 text-white/30 gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading workers…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/25 gap-2 text-sm">
                  <UserCircle2 size={28} strokeWidth={1} />
                  {workerSearch ? "No workers match" : "No workers found"}
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
                        selected ? "bg-blue-500/10" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {selected ? (
                          <Check size={14} />
                        ) : (
                          worker.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Name + role */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            selected ? "text-blue-300" : "text-white"
                          }`}
                        >
                          {worker.name}
                        </p>
                        {(worker.role || worker.department) && (
                          <p className="text-xs text-white/35 truncate">
                            {[worker.role, worker.department]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      {/* Checkbox indicator */}
                      <div
                        className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                          selected
                            ? "bg-blue-500 border-blue-500"
                            : "border-white/20"
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold transition-colors mt-4"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating…
            </>
          ) : (
            "Create Subtask"
          )}
        </button>
      </div>
    </div>
  );
}