"use client";

import { useRouter } from "next/navigation";
import { useCreateTask } from "@/hooks/quality/useCreateTask";
import { ArrowLeft, CalendarRange, Loader2, AlertCircle, ChevronDown } from "lucide-react";

function formatDateRangeSummary(start: string, end: string): string | null {
  if (!start || !end) return null;
  return `${new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → ${new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const {
    form,
    sites,
    selectedSite,
    siteDropdownOpen,
    loadingSites,
    submitting,
    error,
    setField,
    selectSite,
    toggleSiteDropdown,
    handleSubmit,
  } = useCreateTask();

  const dateRangeSummary = formatDateRangeSummary(form.start_date, form.end_date);
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
          <input value={form.name} onChange={setField("name")} placeholder="e.g. SubStructure Works" className="gv-input" />
        </div>

        <div>
          <label className="gv-label">Description</label>
          <textarea
            value={form.description}
            onChange={setField("description")}
            placeholder="Brief description of the task…"
            rows={4}
            className="gv-input resize-none"
          />
        </div>

        <div>
          <label className="gv-label">Site <span className="text-red-400">*</span></label>
          <div className="relative">
            <button
              onClick={toggleSiteDropdown}
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
                    onClick={() => selectSite(site)}
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
                <input type="date" value={form.start_date} onChange={setField("start_date")} className="gv-input [color-scheme:dark]" />
              </div>
              <div>
                <span className="gv-eyebrow block mb-1.5">End date</span>
                <input type="date" value={form.end_date} min={form.start_date} onChange={setField("end_date")} className="gv-input [color-scheme:dark]" />
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