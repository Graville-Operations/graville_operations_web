"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, CalendarRange, Loader2, AlertCircle } from "lucide-react";
import { bustTaskCache } from "../../page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

const INITIAL: FormState = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTaskPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Task name is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post("/tasks/create", {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });
      bustTaskCache();
      router.back();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? (e as Error)?.message ?? "Failed to create task";
      setError(msg);
      setSubmitting(false);
    }
  }

  const dateRangeSummary =
    form.start_date && form.end_date
      ? `${new Date(form.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → ${new Date(form.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  // ── Render ──────────────────────────────────────────────────────────────────

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
          <h1 className="text-xl font-bold tracking-tight">Create Task</h1>
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
            placeholder="e.g. SubStructure Works"
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
            placeholder="Brief description of the task…"
            rows={4}
            className="w-full rounded-2xl bg-white/[0.06] border border-white/8 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
          />
        </div>

        {/* Date Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarRange size={12} />
            Date Range
          </label>
          <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-white/35">Start date</span>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={set("start_date")}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/8 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-white/35">End date</span>
                <input
                  type="date"
                  value={form.end_date}
                  min={form.start_date}
                  onChange={set("end_date")}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/8 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            {dateRangeSummary && (
              <p className="text-xs text-blue-400/80 flex items-center gap-1.5">
                <CalendarRange size={11} />
                {dateRangeSummary}
              </p>
            )}
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
            "Create Task"
          )}
        </button>
      </div>
    </div>
  );
}