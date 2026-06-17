"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
  type Department,
  getDeptCache,
  setDeptCache,
  bustDeptCache,
} from "@/lib/departments-cache";

interface RawDepartment {
  id: number;
  name: string;
  description?: string;
  menus: number;   // count from API
  users: number;   // count from API
}

export function parseList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray((d.data as any)?.items)) return (d.data as any).items;
    if (Array.isArray(d.data)) return d.data as any[];
    for (const key of ["items", "results", "list", "records", "rows", "departments"]) {
      if (Array.isArray(d[key])) return d[key] as any[];
    }
    for (const key of Object.keys(d)) {
      if (Array.isArray(d[key])) return d[key] as any[];
    }
  }
  return [];
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white
        text-sm font-semibold z-[60] shadow-xl pointer-events-none
        ${type === "success" ? "bg-[#33907c]" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
}


const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MenusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SpinnerIcon = ({ size = 14 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


function CreateDeptModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Department name is required."); return; }
    try {
      setIsSubmitting(true); setError(null);
      await api.post("/departments/create", { name: name.trim(), description: description.trim() });
      onCreated(); onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? "Failed to create department.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ animation: "fadeUp 0.22s ease" }}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--gv-brand) 18%, transparent)",
                border: "1px solid color-mix(in srgb, var(--gv-brand) 35%, transparent)",
                color: "var(--gv-brand)",
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">New Department</h2>
              <p className="text-white/40 text-sm mt-0.5">Fill in the details below to get started</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <CloseIcon />
          </button>
        </div>
        <div className="px-7 py-6 space-y-5">
          <div className="space-y-2">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Department Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. Finance, Operations, Engineering…"
              className="w-full gv-input px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Description
              <span className="text-white/30 font-normal normal-case tracking-normal ml-2">— optional</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this department do?"
              rows={4}
              className="w-full gv-input px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none resize-none"
            />
          </div>
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/25">
              <span className="text-red-400 text-base leading-none mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="px-7 pb-7 flex gap-3">
          <button type="button" onClick={onClose} className="gv-btn-outline flex-1 justify-center text-sm py-3" disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: "var(--gv-brand)", color: "#fff" }}
          >
            {isSubmitting ? <SpinnerIcon /> : <PlusIcon />}
            {isSubmitting ? "Creating…" : "Create Department"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:scale(0.96) translateY(10px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}

function DepartmentCard({
  dept, onClick,
}: {
  dept: Department;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === "Enter" && onClick()}
      className="gv-card p-0 overflow-hidden flex flex-col cursor-pointer transition-all"
      style={{ borderTop: "3px solid var(--gv-brand)", outline: "none" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px color-mix(in srgb, var(--gv-brand) 22%, transparent)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Top section */}
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "color-mix(in srgb, var(--gv-brand) 22%, transparent)", color: "var(--gv-brand)" }}
          >
            <BuildingIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm leading-tight truncate">{dept.name}</p>
            <p className="text-white/45 text-xs mt-1 line-clamp-2 leading-relaxed">
              {dept.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Count chips */}
      <div className="px-4 py-3 pb-4 flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 justify-center"
          style={{ background: "color-mix(in srgb, var(--gv-brand) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--gv-brand) 28%, transparent)" }}
        >
          <span style={{ color: "var(--gv-brand)" }}><MenusIcon /></span>
          <span className="font-bold text-sm" style={{ color: "var(--gv-brand)" }}>{dept.menusCount}</span>
          <span className="text-white/40 text-xs">Menus</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 justify-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span className="text-white/40"><UsersIcon /></span>
          <span className="font-bold text-sm text-white/80">{dept.usersCount}</span>
          <span className="text-white/40 text-xs">Users</span>
        </div>
      </div>
    </div>
  );
}


function SkeletonCard() {
  return (
    <div className="gv-card p-0 overflow-hidden animate-pulse" style={{ borderTop: "3px solid rgba(255,255,255,0.08)" }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="px-4 py-3 pb-4 flex gap-3">
        <div className="h-9 bg-white/5 rounded-xl flex-1" />
        <div className="h-9 bg-white/5 rounded-xl flex-1" />
      </div>
    </div>
  );
}


export default function DepartmentsPage() {
  const router = useRouter();

  // ── Hydrate instantly from cache (memory or localStorage) ──────────────────
  const [departments, setDepartments] = useState<Department[]>(() => getDeptCache() ?? []);
  const [isLoading, setIsLoading] = useState(() => getDeptCache() === null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDepartments = useCallback(async (force = false) => {
    const cached = getDeptCache();
    if (!force && cached) {
      setDepartments(cached);
      setIsLoading(false);
      return;
    }


    if (cached) setDepartments(cached);
    setIsLoading(!cached);

    try {
      const { data } = await api.get("/departments/list");
      const raw = parseList(data);

      if (raw.length === 0) {
        console.warn("[Departments] parseList returned [] for response:", data);
        // Don't wipe out a previously cached non-empty list on an empty
        // response — likely a transient/auth issue rather than "no depts".
        if (!cached || cached.length === 0) {
          setDepartments([]);
          setDeptCache([]);
        }
        setIsLoading(false);
        return;
      }

      const mapped: Department[] = raw.map((d: RawDepartment) => ({
        id: d.id,
        name: d.name,
        description: d.description ?? "",
        menusCount: typeof d.menus === "number" ? d.menus : 0,
        usersCount: typeof d.users === "number" ? d.users : 0,
      }));

      setDeptCache(mapped);
      setDepartments(mapped);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
      const message = typeof detail === "string"
        ? detail
        : status
        ? `Failed to load departments (${status})`
        : "Failed to load departments — showing cached data";
      console.error("[Departments] list fetch failed:", status, err?.response?.data ?? err?.message);
     
      if (cached) {
        showToast(message, "error");
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleCardClick = useCallback((dept: Department) => {
    router.push(`/sections/departments/${dept.id}`);
  }, [router]);

  const filtered = useMemo(
    () => departments.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()),
    ),
    [departments, search],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow mb-1">Sections</p>
          <h1 className="text-white text-2xl font-bold">Departments</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--gv-brand)", color: "#fff" }}
        >
          <PlusIcon /> Add Department
        </button>
      </div>

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search departments…"
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        )}
      </div>

      <p className="gv-eyebrow">
        All Departments {!isLoading && `(${filtered.length})`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-white/40 text-sm">
            {search ? "No departments match your search." : "No departments found."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mx-auto"
              style={{
                background: "color-mix(in srgb, var(--gv-brand) 13%, transparent)",
                border: "1px solid color-mix(in srgb, var(--gv-brand) 27%, transparent)",
                color: "var(--gv-brand)",
              }}
            >
              <PlusIcon /> Create your first department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filtered.map(dept => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              onClick={() => handleCardClick(dept)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}

      {showCreate && (
        <CreateDeptModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            showToast("Department created successfully!", "success");
            bustDeptCache();
            fetchDepartments(true);
          }}
        />
      )}
    </div>
  );
}