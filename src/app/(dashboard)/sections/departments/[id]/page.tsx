"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "active" | "inactive";
}

interface DepartmentInfo {
  id: number;
  name: string;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const PALETTE = [
  "#3B5BDB", "#0E7C5E", "#B45309",
  "#6D28D9", "#B91C1C", "#0369A1",
];

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
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
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
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

// ─── User Detail Sheet ────────────────────────────────────────────────────────
function UserSheet({ user, accentHex, onClose }: {
  user: User;
  accentHex: string;
  onClose: () => void;
}) {
  const rows = [
    { emoji: "🏷️", label: "Full Name", value: user.name },
    { emoji: "📧", label: "Email",     value: user.email },
    { emoji: "📱", label: "Phone",     value: user.phone ?? "—" },
    { emoji: "🎯", label: "Role",      value: user.role },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-t-2xl flex flex-col"
        style={{ maxHeight: "80vh", animation: "slideUp 0.22s ease" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/10 shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `${accentHex}22`, color: accentHex, border: `1px solid ${accentHex}44` }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">{user.name}</p>
            <p className="text-xs font-medium" style={{ color: accentHex }}>{user.role}</p>
          </div>
          <span
            className="text-[10px] font-semibold px-3 py-1 rounded-full shrink-0"
            style={{
              background: user.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
              color:      user.status === "active" ? "#34d399" : "rgba(255,255,255,0.35)",
              border:     `1px solid ${user.status === "active" ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rows.map(r => (
            <div
              key={r.label}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{r.emoji}</span>
                <span className="text-white/50 text-xs font-medium">{r.label}</span>
              </div>
              <span className="text-white text-xs font-semibold max-w-[180px] truncate text-right">
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* Close */}
        <div className="p-4 shrink-0 border-t border-white/10">
          <button onClick={onClose} className="gv-btn-outline w-full justify-center text-sm py-2.5">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────
function UserCard({ user, accentHex, onTap }: {
  user: User;
  accentHex: string;
  onTap: () => void;
}) {
  return (
    <div
      onClick={onTap}
      className="gv-card gv-card-hover p-0 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `${accentHex}18`, color: accentHex, border: `1px solid ${accentHex}33` }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-white/45 text-xs truncate">{user.email}</p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: user.status === "active" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
              color:      user.status === "active" ? "#34d399" : "rgba(255,255,255,0.3)",
              border:     `1px solid ${user.status === "active" ? "rgba(52,211,153,0.22)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Role + phone */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: `${accentHex}18`, color: accentHex }}
          >
            {user.role || "—"}
          </span>
          {user.phone && (
            <span className="flex items-center gap-1 text-white/35 text-xs">
              <PhoneIcon />
              {user.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="gv-card animate-pulse p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-full" />
        </div>
      </div>
      <div className="h-5 bg-white/5 rounded w-1/3" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DepartmentUsersPage() {
  const router = useRouter();
  const params = useParams();
  const deptId = Number(params?.id);

  const [deptInfo, setDeptInfo]   = useState<DepartmentInfo | null>(null);
  const [users, setUsers]         = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState("");
  const [accentHex, setAccentHex] = useState(PALETTE[0]);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [toast, setToast]         = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch department info ──────────────────────────────────────────────────
  const fetchDeptInfo = useCallback(async () => {
    try {
      const { data } = await api.get("/departments/list");
      const raw: any[] = data?.data?.items ?? data?.items ?? data?.data ?? [];
      const idx = raw.findIndex((d: any) => d.id === deptId);
      if (idx >= 0) {
        setDeptInfo({
          id: raw[idx].id,
          name: raw[idx].name,
          description: raw[idx].description ?? "",
        });
        setAccentHex(PALETTE[idx % PALETTE.length]);
      }
    } catch {
      // Non-critical
    }
  }, [deptId]);

  // ── Fetch users for this department ───────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/departments/${deptId}/members`);
      const raw: any[] = data?.data?.items ?? data?.items ?? data?.data ?? [];
      const mapped: User[] = raw.map((u: any) => ({
        id: u.id,
        name: u.name ?? u.full_name ??
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
        email: u.email ?? "",
        phone: u.phone ?? u.phone_number ?? undefined,
        role: u.role ?? u.job_title ?? "",
        status: u.status === "active" || u.is_active === true ? "active" : "inactive",
      }));
      setUsers(mapped);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [deptId, showToast]);

  useEffect(() => {
    if (!deptId) return;
    fetchDeptInfo();
    fetchUsers();
  }, [deptId, fetchDeptInfo, fetchUsers]);

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }), [users, search]);

  const activeCount   = users.filter(u => u.status === "active").length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="gv-btn-outline p-2 mt-1 shrink-0"
          >
            <BackIcon />
          </button>
          <div>
            <p className="gv-eyebrow mb-1">Departments</p>
            <h1 className="text-white text-2xl font-bold">
              {deptInfo?.name ?? "Department"}
            </h1>
            {deptInfo?.description && (
              <p className="text-white/40 text-sm mt-1">{deptInfo.description}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center shrink-0"
        >
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* ── Stat chips ── */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total",    value: users.length,  color: accentHex },
            { label: "Active",   value: activeCount,   color: "#34d399" },
            { label: "Inactive", value: inactiveCount, color: "rgba(255,255,255,0.3)" },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}
            >
              <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
              <span className="text-white/50 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* ── Count ── */}
      <p className="gv-eyebrow">
        {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "user" : "users"}`}
      </p>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-white/40 text-sm">
            {search ? "No users match your search." : "No users in this department."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filtered.map(user => (
            <UserCard
              key={user.id}
              user={user}
              accentHex={accentHex}
              onTap={() => setDetailUser(user)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── User detail sheet ── */}
      {detailUser && (
        <UserSheet
          user={detailUser}
          accentHex={accentHex}
          onClose={() => setDetailUser(null)}
        />
      )}
    </div>
  );
}