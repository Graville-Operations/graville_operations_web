"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Department {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  departmentId?: number;
  departmentName?: string;
  status: "active" | "inactive";
}

// ─── Dept colour map (matches groups page palette) ────────────────────────────
const DEPT_COLORS = [
  "#3B5BDB", "#0E7C5E", "#B45309",
  "#6D28D9", "#B91C1C", "#0369A1",
];

function deptColor(index: number) {
  return DEPT_COLORS[index % DEPT_COLORS.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

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
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

// ─── Shared Modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, actions }: {
  title: string; onClose: () => void;
  children: React.ReactNode; actions: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gv-card w-full max-w-md"
        style={{ animation: "gvFadeUp .18s ease", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="gv-eyebrow mb-1">Departments / Users</p>
            <h2 className="text-base font-semibold text-white">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="gv-btn-outline" style={{ padding: "6px 8px" }}>
            <IconX />
          </button>
        </div>
        <div className="gv-divider mb-5" />
        {children}
        <div className="gv-divider mt-5 mb-4" />
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="gv-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="gv-input"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-4">
      <label className="gv-label">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="gv-input appearance-none pr-8 cursor-pointer"
          style={{ background: "var(--gv-glass-bg)" }}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: "#0d1528", color: "#fff" }}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--gv-text-subtle)" }}>
          <IconChevronDown />
        </div>
      </div>
    </div>
  );
}

// ─── User Form Content (OUTSIDE page — fixes input focus bug) ─────────────────
function UserFormContent({
  fName,     setFName,
  fEmail,    setFEmail,
  fPhone,    setFPhone,
  fRole,     setFRole,
  fPassword, setFPassword,
  fStatus,   setFStatus,
  isCreate = false,
}: {
  fName: string;     setFName: (v: string) => void;
  fEmail: string;    setFEmail: (v: string) => void;
  fPhone: string;    setFPhone: (v: string) => void;
  fRole: string;     setFRole: (v: string) => void;
  fPassword: string; setFPassword: (v: string) => void;
  fStatus: "active" | "inactive"; setFStatus: (v: "active" | "inactive") => void;
  isCreate?: boolean;
}) {
  return (
    <>
      <Field label="Full Name" value={fName}  onChange={setFName}  placeholder="e.g. Alice Kamau" />
      <Field label="Email"     value={fEmail} onChange={setFEmail} placeholder="alice@example.co.ke" type="email" />
      <Field label="Phone"     value={fPhone} onChange={setFPhone} placeholder="+254 7xx xxx xxx" />
      <Field label="Role"      value={fRole}  onChange={setFRole}  placeholder="e.g. Driver" />
      {isCreate && (
        <Field
          label="Password"
          value={fPassword}
          onChange={setFPassword}
          placeholder="Temporary password"
          type="password"
        />
      )}
      <SelectField
        label="Status"
        value={fStatus}
        onChange={v => setFStatus(v as "active" | "inactive")}
        options={[
          { value: "active",   label: "Active"   },
          { value: "inactive", label: "Inactive" },
        ]}
      />
    </>
  );
}

// ─── User detail sheet ────────────────────────────────────────────────────────
function UserSheet({ user, color, onClose, onEdit, onDelete }: {
  user: User; color: string; onClose: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const rows = [
    { emoji: "🏷️", label: "Name",       value: user.name },
    { emoji: "📧", label: "Email",      value: user.email },
    { emoji: "📱", label: "Phone",      value: user.phone ?? "—" },
    { emoji: "🎯", label: "Role",       value: user.role },
    { emoji: "👥", label: "Department", value: user.departmentName ?? "—" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gv-card w-full max-w-lg rounded-b-none"
        style={{ animation: "gvSlideUp .22s ease", maxHeight: "85vh", overflowY: "auto", borderBottom: "none" }}
      >
        <div className="flex justify-center pt-1 pb-4">
          <div className="w-9 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: `${color}1a`, color, border: `1px solid ${color}44` }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base truncate">{user.name}</div>
            <div className="text-xs font-medium" style={{ color }}>
              {user.role}{user.departmentName ? ` · ${user.departmentName}` : ""}
            </div>
          </div>
          <span
            className="text-[10px] font-semibold px-3 py-1 rounded-full"
            style={{
              background: user.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
              color:      user.status === "active" ? "#34d399" : "rgba(255,255,255,0.35)",
              border:     `1px solid ${user.status === "active" ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="gv-divider mb-4" />

        <div className="space-y-2 mb-5">
          {rows.map(r => (
            <div
              key={r.label}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{r.emoji}</span>
                <span className="text-xs" style={{ color: "var(--gv-text-subtle)" }}>{r.label}</span>
              </div>
              <span className="text-xs font-semibold text-white max-w-[55%] text-right truncate">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={() => { onClose(); onEdit(); }}
            className="gv-btn-outline flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <IconEdit /> Edit
          </button>
          <button
            type="button"
            onClick={() => { onClose(); onDelete(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg"
            style={{ background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.28)", color: "#f87171" }}
          >
            <IconTrash /> Deactivate
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="gv-btn-outline w-full flex items-center justify-center gap-2 py-2.5 text-sm"
        >
          <IconX /> Close
        </button>
      </div>
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────
function UserCard({ user, color, onTap, onEdit, onDelete }: {
  user: User; color: string;
  onTap: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onTap}
      className="gv-card gv-card-hover flex flex-col gap-3 cursor-pointer"
      style={{ padding: "1rem" }}
    >
      <div
        className="h-px -mx-1 -mt-1 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}55, transparent)` }}
      />

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
        >
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white font-semibold text-sm truncate">{user.name}</div>
          <div className="text-xs truncate" style={{ color: "var(--gv-text-muted)" }}>{user.email}</div>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: user.status === "active" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
            color:      user.status === "active" ? "#34d399" : "rgba(255,255,255,0.3)",
            border:     `1px solid ${user.status === "active" ? "rgba(52,211,153,0.22)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {user.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="gv-tag">{user.role}</span>
        {user.departmentName && (
          <span className="gv-tag" style={{ color, borderColor: `${color}40` }}>{user.departmentName}</span>
        )}
      </div>

      <div className="gv-divider" />
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onEdit}
          className="gv-btn-outline flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5"
        >
          <IconEdit /> Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg font-medium transition-all"
          style={{ background: "rgba(239,83,80,0.07)", border: "1px solid rgba(239,83,80,0.2)", color: "#f87171" }}
        >
          <IconTrash /> Deactivate
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]               = useState<User[]>([]);
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSaving, setIsSaving]         = useState(false);
  const [search, setSearch]             = useState("");
  const [filterDept, setFilterDept]     = useState("all");
  const [toast, setToast]               = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [addOpen, setAddOpen]           = useState(false);
  const [editTarget, setEditTarget]     = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [detailTarget, setDetailTarget] = useState<User | null>(null);

  // ── Form state (lifted here; passed as props to UserFormContent) ────────────
  const [fName,     setFName]     = useState("");
  const [fEmail,    setFEmail]    = useState("");
  const [fPhone,    setFPhone]    = useState("");
  const [fRole,     setFRole]     = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fStatus,   setFStatus]   = useState<"active" | "inactive">("active");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const resetForm = () => {
    setFName(""); setFEmail(""); setFPhone("");
    setFRole(""); setFPassword(""); setFStatus("active");
  };

  // ── Fetch departments (for filter dropdown) ─────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await api.get("/departments/list");
      const raw: any[] = data?.data?.items ?? data?.items ?? data?.data ?? data ?? [];
      setDepartments(raw.map((d: any, idx: number) => ({
        id: d.id,
        name: d.name,
        color: deptColor(idx),
      })));
    } catch {
      // Non-critical — filter just won't show dept names
    }
  }, []);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/users/list");
      const raw: any[] = data?.data?.items ?? data?.items ?? data?.data ?? data ?? [];

      const mapped: User[] = raw.map((u: any) => {
        const deptId: number | undefined   = u.department_id ?? u.departmentId ?? u.department?.id;
        const deptName: string | undefined = u.department?.name ?? u.department_name ?? u.departmentName;

        return {
          id: u.id,
          name: u.name ?? u.full_name ??
            `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim(),
          email: u.email ?? "",
          phone: u.phone ?? u.phone_number ?? undefined,
          role: u.role ?? u.job_title ?? "",
          departmentId: deptId,
          departmentName: deptName,
          status: u.accountStatus === "active" || u.status === "active" || u.is_active === true
            ? "active" : "inactive",
        };
      });

      setUsers(mapped);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, [fetchDepartments, fetchUsers]);

  // ── Colour helper ───────────────────────────────────────────────────────────
  const colorForUser = useCallback((user: User): string => {
    if (!user.departmentId) return DEPT_COLORS[0];
    const idx = departments.findIndex(d => d.id === user.departmentId);
    return idx >= 0 ? deptColor(idx) : DEPT_COLORS[0];
  }, [departments]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!fName.trim() || !fEmail.trim()) return;
    try {
      setIsSaving(true);
      await api.post("/users/create", {
        name:     fName.trim(),
        email:    fEmail.trim(),
        phone:    fPhone.trim() || undefined,
        role:     fRole.trim()  || undefined,
        password: fPassword     || undefined,
        status:   fStatus,
      });
      showToast("User created successfully", "success");
      setAddOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.detail ?? "Failed to create user";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editTarget || !fName.trim() || !fEmail.trim()) return;
    try {
      setIsSaving(true);
      await api.patch(`/users/${editTarget.id}`, {
        name:   fName.trim(),
        email:  fEmail.trim(),
        phone:  fPhone.trim() || undefined,
        role:   fRole.trim()  || undefined,
        status: fStatus,
      });
      showToast("User updated successfully", "success");
      setEditTarget(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.detail ?? "Failed to update user";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (u: User) => {
    setFName(u.name);
    setFEmail(u.email);
    setFPhone(u.phone ?? "");
    setFRole(u.role);
    setFPassword("");
    setFStatus(u.status);
    setEditTarget(u);
  };

  // ── Deactivate ──────────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      setIsSaving(true);
      await api.delete(`/users/${deleteTarget.id}`);
      showToast("User deactivated successfully", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.detail ?? "Failed to deactivate user";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      const matchDept = filterDept === "all" || String(u.departmentId) === filterDept;
      return matchSearch && matchDept;
    }), [users, search, filterDept]);

  const activeCount   = users.filter(u => u.status === "active").length;
  const inactiveCount = users.length - activeCount;

  return (
    <>
      <style>{`
        @keyframes gvFadeUp  { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:none } }
        @keyframes gvSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="gv-eyebrow mb-2">Departments</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="gv-icon-box"><IconUser /></span>
            Users
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--gv-text-muted)" }}>
            Manage all system users and their department assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={fetchUsers} className="gv-btn-outline flex items-center gap-2 px-3 py-2 text-sm">
            <RefreshIcon /> Refresh
          </button>
          <button
            type="button"
            onClick={() => { resetForm(); setAddOpen(true); }}
            className="gv-btn-brand flex items-center gap-2"
          >
            <IconPlus /> Add User
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length,  color: "#60a5fa" },
          { label: "Active",      value: activeCount,   color: "#34d399" },
          { label: "Inactive",    value: inactiveCount, color: "rgba(255,255,255,0.3)" },
        ].map(s => (
          <div key={s.label} className="gv-card gv-stat-card flex items-center gap-4">
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="gv-eyebrow leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + filter ── */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gv-text-subtle)" }}>
            <IconSearch />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or role…"
            className="gv-input pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="gv-input appearance-none pr-8 cursor-pointer"
            style={{ minWidth: 140, background: "var(--gv-glass-bg)" }}
          >
            <option value="all" style={{ background: "#0d1528" }}>All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={String(d.id)} style={{ background: "#0d1528", color: "#fff" }}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--gv-text-subtle)" }}>
            <IconChevronDown />
          </div>
        </div>
      </div>

      {/* ── Section eyebrow ── */}
      <p className="gv-eyebrow mb-4">
        {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "user" : "users"}`}
        {filterDept !== "all" && departments.length > 0 &&
          ` · ${departments.find(d => String(d.id) === filterDept)?.name ?? ""}`
        }
      </p>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="gv-card h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="gv-card text-center py-16 gv-eyebrow">
          {search || filterDept !== "all" ? "No users match your filters." : "No users yet."}
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}
              color={colorForUser(u)}
              onTap={() => setDetailTarget(u)}
              onEdit={() => openEdit(u)}
              onDelete={() => setDeleteTarget(u)}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Add modal ── */}
      {addOpen && (
        <Modal
          title="Add User"
          onClose={() => { setAddOpen(false); resetForm(); }}
          actions={
            <>
              <button type="button" onClick={() => { setAddOpen(false); resetForm(); }} className="gv-btn-outline px-5 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isSaving || !fName.trim() || !fEmail.trim()}
                className="gv-btn-brand px-5 py-2 text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Add User"}
              </button>
            </>
          }
        >
          <UserFormContent
            fName={fName}         setFName={setFName}
            fEmail={fEmail}       setFEmail={setFEmail}
            fPhone={fPhone}       setFPhone={setFPhone}
            fRole={fRole}         setFRole={setFRole}
            fPassword={fPassword} setFPassword={setFPassword}
            fStatus={fStatus}     setFStatus={setFStatus}
            isCreate
          />
        </Modal>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <Modal
          title={`Edit — ${editTarget.name}`}
          onClose={() => { setEditTarget(null); resetForm(); }}
          actions={
            <>
              <button type="button" onClick={() => { setEditTarget(null); resetForm(); }} className="gv-btn-outline px-5 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={isSaving || !fName.trim() || !fEmail.trim()}
                className="gv-btn-brand px-5 py-2 text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </>
          }
        >
          <UserFormContent
            fName={fName}         setFName={setFName}
            fEmail={fEmail}       setFEmail={setFEmail}
            fPhone={fPhone}       setFPhone={setFPhone}
            fRole={fRole}         setFRole={setFRole}
            fPassword={fPassword} setFPassword={setFPassword}
            fStatus={fStatus}     setFStatus={setFStatus}
          />
        </Modal>
      )}

      {/* ── Deactivate modal ── */}
      {deleteTarget && (
        <Modal
          title="Deactivate User"
          onClose={() => setDeleteTarget(null)}
          actions={
            <>
              <button type="button" onClick={() => setDeleteTarget(null)} className="gv-btn-outline px-5 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-semibold rounded-lg disabled:opacity-50"
                style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.35)", color: "#f87171" }}
              >
                {isSaving ? "Processing…" : "Deactivate"}
              </button>
            </>
          }
        >
          <p className="text-sm" style={{ color: "var(--gv-text-muted)" }}>
            Deactivate{" "}
            <span className="text-white font-semibold">"{deleteTarget.name}"</span>?
            {" "}They will lose access to the system. This can be reversed by editing the user.
          </p>
        </Modal>
      )}

      {/* ── Detail sheet ── */}
      {detailTarget && (
        <UserSheet
          user={detailTarget}
          color={colorForUser(detailTarget)}
          onClose={() => setDetailTarget(null)}
          onEdit={() => openEdit(detailTarget)}
          onDelete={() => setDeleteTarget(detailTarget)}
        />
      )}
    </>
  );
}