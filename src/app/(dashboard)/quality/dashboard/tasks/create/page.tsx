"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { cacheBust } from "@/lib/persistent-cache";
import { setSites, getAllSites, sitesLoaded, type Site } from "@/lib/sites-cache";
import { ArrowLeft, CalendarRange, Loader2, AlertCircle, ChevronDown } from "lucide-react";

interface FormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

function parseList<T>(data: unknown): T[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const arr = d?.items ?? d?.data ?? d?.sites ?? data;
  return Array.isArray(arr) ? arr : [];
}

export default function CreateTaskPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSiteId = searchParams.get("site_id");

  const [form, setForm]             = useState<FormState>({ name: "", description: "", start_date: "", end_date: "" });
  const [sites, setSitesState]      = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ── Load sites from the shared hash map cache, else fetch once ────────────
  useEffect(() => {
    if (sitesLoaded()) {
      const list = getAllSites();
      setSitesState(list);
      if (preSelectedSiteId) {
        const found = list.find((s) => s.id === Number(preSelectedSiteId));
        if (found) setSelectedSite(found);
      }
      setLoadingSites(false);
      return;
    }

    api.get("/sites/list")
      .then((res) => {
        const list = parseList<Site>(res.data?.data ?? res.data);
        setSites(list);
        setSitesState(list);
        if (preSelectedSiteId) {
          const found = list.find((s) => s.id === Number(preSelectedSiteId));
          if (found) setSelectedSite(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSites(false));
  }, [preSelectedSiteId]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name.trim())  { setError("Task name is required"); return; }
    if (!selectedSite)      { setError("Please select a site"); return; }
    if (!form.start_date)   { setError("Start date is required"); return; }
    if (!form.end_date)     { setError("End date is required"); return; }

    setSubmitting(true);
    setError(null);
    try {
   
      await api.post("/tasks/task/create", {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        site_id:     selectedSite.id,
        start_date:  form.start_date,
        end_date:    form.end_date,
      });
      cacheBust(`tasks:${selectedSite.id}`);
      router.back();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e as Error)?.message ?? "Failed to create task";
      setError(msg);
      setSubmitting(false);
    }
  }

  const dateRangeSummary =
    form.start_date && form.end_date
      ? `${new Date(form.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → ${new Date(form.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  const canSubmit = !submitting && !!form.name.trim() && !!selectedSite && !!form.start_date && !!form.end_date;

  return (
    <div className="gv-page-dashboard">
      <div className="gv-nav sticky top-0 z-20 px-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="gv-btn-outline p-2 w-9 h-9 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[var(--gv-text-primary)] tracking-tight">Create Task</h1>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-5">
        {error && (
          <div className="gv-card flex items-center gap-2 text-sm text-red-400 border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div>
          <label className="gv-label">Name <span className="text-red-400">*</span></label>
          <input value={form.name} onChange={set("name")} placeholder="e.g. SubStructure Works" className="gv-input" />
        </div>

        <div>
          <label className="gv-label">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Brief description of the task…"
            rows={4}
            className="gv-input resize-none"
          />
        </div>

        <div>
          <label className="gv-label">Site <span className="text-red-400">*</span></label>
          <div className="relative">
            <button
              onClick={() => setSiteDropdownOpen((o) => !o)}
              className="gv-input flex items-center justify-between text-left"
            >
              <span className={selectedSite ? "text-[var(--gv-text-primary)]" : "text-[var(--gv-text-faint)]"}>
                {loadingSites ? "Loading sites…" : selectedSite ? selectedSite.name : "Select a site"}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-[var(--gv-text-subtle)] ${siteDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {siteDropdownOpen && sites.length > 0 && (
              <div className="gv-dropdown w-full mt-1 z-30">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => { setSelectedSite(site); setSiteDropdownOpen(false); }}
                    className={`gv-dropdown-item ${selectedSite?.id === site.id ? "gv-dropdown-item--active" : ""}`}
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="gv-label flex items-center gap-1.5">
            <CalendarRange size={12} />
            Date Range <span className="text-red-400">*</span>
          </label>
          <div className="gv-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="gv-eyebrow block mb-1.5">Start date</span>
                <input type="date" value={form.start_date} onChange={set("start_date")} className="gv-input [color-scheme:dark]" />
              </div>
              <div>
                <span className="gv-eyebrow block mb-1.5">End date</span>
                <input type="date" value={form.end_date} min={form.start_date} onChange={set("end_date")} className="gv-input [color-scheme:dark]" />
              </div>
            </div>
            {dateRangeSummary && (
              <p className="text-xs text-[var(--gv-brand)] flex items-center gap-1.5">
                <CalendarRange size={11} /> {dateRangeSummary}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gv-btn-brand w-full py-3.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create Task"}
        </button>
      </div>
    </div>
  );
}