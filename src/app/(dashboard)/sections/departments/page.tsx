"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  accentHex: string;
  menus: Menu[];
  menusLoading: boolean;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  "#3B5BDB", "#0E7C5E", "#B45309",
  "#6D28D9", "#B91C1C", "#0369A1",
];
function accentFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold z-50 shadow-xl ${
      type === "success" ? "bg-[#33907c]" : "bg-red-600"
    }`}>
      {message}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
);

// ─── Department Card ──────────────────────────────────────────────────────────
function DepartmentCard({
  dept,
  onViewUsers,
}: {
  dept: Department;
  onViewUsers: () => void;
}) {
  const { accentHex, menus, menusLoading } = dept;

  return (
    <div
      className="gv-card p-0 overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${accentHex}` }}
    >
      {/* ── Header: name + description ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${accentHex}22`, color: accentHex }}
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

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-white/8" />

      {/* ── Menus list ── */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <span style={{ color: accentHex }}>
            <MenuIcon />
          </span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            Menus
          </span>
          {!menusLoading && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: `${accentHex}22`, color: accentHex }}
            >
              {menus.length}
            </span>
          )}
        </div>

        {menusLoading ? (
          <div className="space-y-1.5">
            {[1, 2].map(i => (
              <div key={i} className="h-6 rounded-md bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <p className="text-white/25 text-xs italic">No menus assigned</p>
        ) : (
          <ul className="space-y-1.5">
            {menus.map(m => (
              <li
                key={m.id}
                className="flex items-center gap-2 text-xs text-white/65"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: accentHex }}
                />
                <span className="truncate">{m.title ?? m.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer: view users button ── */}
      <div className="px-4 pb-4 pt-2">
        <button
          type="button"
          onClick={onViewUsers}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group"
          style={{
            background: `${accentHex}14`,
            border: `1px solid ${accentHex}35`,
            color: accentHex,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentHex}28`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentHex}14`;
          }}
        >
          <div className="flex items-center gap-2">
            <UsersIcon />
            <span>View Users</span>
          </div>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="gv-card p-0 overflow-hidden animate-pulse" style={{ borderTop: "3px solid rgba(255,255,255,0.08)" }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/4" />
        <div className="h-5 bg-white/5 rounded" />
        <div className="h-5 bg-white/5 rounded w-4/5" />
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="h-9 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [toast, setToast]             = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch menus for one department ─────────────────────────────────────────
  const fetchMenusForDept = useCallback(async (deptId: number) => {
    try {
      const { data } = await api.get(`/departments/${deptId}/menus`);
      const raw: any[] = data?.items ?? data?.data ?? data ?? [];
      return raw.map((m: any) => ({
        id: m.id,
        name: m.name ?? "",
        title: m.title ?? m.name ?? "",
        link: m.link ?? undefined,
      })) as Menu[];
    } catch {
      return [] as Menu[];
    }
  }, []);

  // ── Fetch all departments then load their menus ────────────────────────────
  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/departments/list");
      const raw: any[] = data?.data?.items ?? data?.items ?? data?.data ?? [];

      const mapped: Department[] = raw.map((d: any, idx: number) => ({
        id: d.id,
        name: d.name,
        description: d.description ?? "",
        accentHex: accentFor(idx),
        menus: [],
        menusLoading: true,
      }));

      setDepartments(mapped);
      setIsLoading(false);

      // Load menus per department in parallel
      const results = await Promise.all(mapped.map(d => fetchMenusForDept(d.id)));
      setDepartments(prev =>
        prev.map((d, i) => ({ ...d, menus: results[i], menusLoading: false }))
      );
    } catch {
      showToast("Failed to load departments", "error");
      setIsLoading(false);
    }
  }, [fetchMenusForDept, showToast]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const filtered = useMemo(() =>
    departments.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    ), [departments, search]);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow mb-1">Sections</p>
          <h1 className="text-white text-2xl font-bold">Departments</h1>
        </div>
        <button
          type="button"
          onClick={fetchDepartments}
          className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center"
        >
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* ── Search ── */}
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

      {/* ── Count label ── */}
      <p className="gv-eyebrow">
        All Departments {!isLoading && `(${filtered.length})`}
      </p>

      {/* ── Grid ── */}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filtered.map(dept => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              onViewUsers={() => router.push(`/sections/departments/${dept.id}/users`)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}