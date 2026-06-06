"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { parseList } from "../page"; // re-use the shared helper; adjust path if needed

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
  accentHex: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const PALETTE = ["#3B5BDB","#0E7C5E","#B45309","#6D28D9","#B91C1C","#0369A1"];
const accentFor = (i: number) => PALETTE[i % PALETTE.length];
const CACHE_TTL = 5 * 60 * 1000;

// ─── Per-dept member cache ────────────────────────────────────────────────────
const membersCache: Record<number, { users: User[]; ts: number }> = {};
const deptInfoCache: Record<number, DepartmentInfo>               = {};

// ─── Toast ────────────────────────────────────────────────────────────────────
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
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const SpinnerIcon = ({ size = 14 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const UsersAddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

// ─── Assign Users Modal ───────────────────────────────────────────────────────
function AssignUsersModal({
  deptId,
  accentHex,
  currentMemberIds,
  onClose,
  onAssigned,
  showToast,
}: {
  deptId: number;
  accentHex: string;
  currentMemberIds: Set<number>;
  onClose: () => void;
  onAssigned: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [allUsers, setAllUsers]           = useState<{ id: number; name: string; email: string; role: string }[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [saving, setSaving]               = useState(false);
  const [localAssigned, setLocalAssigned] = useState<Set<number>>(new Set(currentMemberIds));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/users/list");
        if (!cancelled) {
          setAllUsers(
            parseList(data).map((u: any) => ({
              id:    u.id,
              name:  u.name ?? u.full_name ?? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
              email: u.email ?? "",
              role:  u.role ?? u.job_title ?? "",
            })),
          );
        }
      } catch {
        if (!cancelled) showToast("Failed to load users", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  const filtered = useMemo(
    () =>
      allUsers.filter(
        u =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase()),
      ),
    [allUsers, search],
  );

  const available = filtered.filter(u => !localAssigned.has(u.id));
  const assigned  = filtered.filter(u =>  localAssigned.has(u.id));

  const handleAssign = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      await api.post(`/departments/${deptId}/assign-users`, {
        user_ids: [...selectedIds],
      });
      setLocalAssigned(prev => new Set([...prev, ...selectedIds]));
      showToast(
        `${selectedIds.size} user${selectedIds.size > 1 ? "s" : ""} assigned`,
        "success",
      );
      setSelectedIds(new Set());
      delete membersCache[deptId]; // bust cache so next load is fresh
      onAssigned();
    } catch {
      showToast("Failed to assign users", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh", animation: "fadeUp 0.2s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${accentHex}22`, color: accentHex }}
            >
              <UsersAddIcon />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Assign Users</h2>
              <p className="text-white/40 text-xs mt-0.5">
                {loading
                  ? "Loading…"
                  : `${available.length} available · ${localAssigned.size} already assigned`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors p-1.5"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 shrink-0">
          <div className="gv-input flex items-center gap-3 py-2.5 px-4">
            <SearchIcon />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or role…"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-white/30 hover:text-white"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {available.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Available ({available.length})
                    </p>
                    <div className="flex items-center gap-3">
                      {selectedIds.size > 0 && (
                        <span className="text-xs font-semibold" style={{ color: accentHex }}>
                          {selectedIds.size} selected
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedIds(new Set(available.map(u => u.id)))}
                        className="text-xs font-semibold"
                        style={{ color: accentHex }}
                      >
                        Select all
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {available.map(user => {
                      const isSelected = selectedIds.has(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() =>
                            setSelectedIds(prev => {
                              const s = new Set(prev);
                              s.has(user.id) ? s.delete(user.id) : s.add(user.id);
                              return s;
                            })
                          }
                          className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all select-none"
                          style={{
                            background: isSelected
                              ? `${accentHex}18`
                              : "rgba(255,255,255,0.04)",
                            border: isSelected
                              ? `1px solid ${accentHex}50`
                              : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                            style={{
                              background: isSelected ? accentHex : "rgba(255,255,255,0.08)",
                              border:     isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                            }}
                          >
                            {isSelected && <CheckIcon />}
                          </div>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              background: isSelected
                                ? `${accentHex}30`
                                : "rgba(255,255,255,0.08)",
                              color: isSelected ? accentHex : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {initials(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-white/40 text-xs truncate">{user.role || user.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {assigned.length > 0 && (
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                    Already in Department ({assigned.length})
                  </p>
                  <div className="space-y-2">
                    {assigned.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                        style={{
                          background: `${accentHex}0e`,
                          border:     `1px solid ${accentHex}28`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: `${accentHex}33`, color: accentHex }}
                        >
                          <CheckIcon />
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: `${accentHex}22`, color: accentHex }}
                        >
                          {initials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-white/40 text-xs truncate">{user.role || user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">👤</p>
                  <p className="text-white/30 text-sm">No users found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="gv-btn-outline px-5 py-2.5 text-sm">
            Close
          </button>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleAssign}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: accentHex, color: "#fff" }}
            >
              {saving ? <SpinnerIcon /> : <PlusIcon />}
              {saving
                ? "Assigning…"
                : `Assign ${selectedIds.size} User${selectedIds.size > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:scale(0.97) translateY(8px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}

// ─── User Detail Sheet ────────────────────────────────────────────────────────
function UserSheet({
  user,
  accentHex,
  onClose,
}: {
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
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/10 shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: `${accentHex}22`,
              color:      accentHex,
              border:     `1px solid ${accentHex}44`,
            }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">{user.name}</p>
            <p className="text-xs font-medium" style={{ color: accentHex }}>{user.role}</p>
          </div>
        </div>
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
function UserCard({
  user,
  accentHex,
  onTap,
}: {
  user: User;
  accentHex: string;
  onTap: () => void;
}) {
  return (
    <div
      onClick={onTap}
      className="gv-card gv-card-hover p-0 overflow-hidden cursor-pointer flex flex-col"
    >
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }}
      />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: `${accentHex}18`,
              color:      accentHex,
              border:     `1px solid ${accentHex}33`,
            }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-white/45 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: `${accentHex}18`, color: accentHex }}
          >
            {user.role || "—"}
          </span>
          {user.phone && (
            <span className="flex items-center gap-1 text-white/35 text-xs">
              <PhoneIcon />{user.phone}
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

  const deptId = useMemo(() => {
    const raw = params?.id;
    const n   = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params?.id]);

  const [deptInfo, setDeptInfo] = useState<DepartmentInfo | null>(
    deptId ? (deptInfoCache[deptId] ?? null) : null,
  );
  const [users, setUsers] = useState<User[]>(
    deptId && membersCache[deptId] ? membersCache[deptId].users : [],
  );
  const [isLoading, setIsLoading] = useState(
    !deptId ||
    !membersCache[deptId] ||
    Date.now() - membersCache[deptId].ts > CACHE_TTL,
  );
  const [search, setSearch]         = useState("");
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [toast, setToast]           = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const accentHex = deptInfo?.accentHex ?? PALETTE[0];

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch department info ────────────────────────────────────────────────
  const fetchDeptInfo = useCallback(async () => {
    if (!deptId) return;
    if (deptInfoCache[deptId]) {
      setDeptInfo(deptInfoCache[deptId]);
      return;
    }
    try {
      // Try direct endpoint first
      try {
        const { data } = await api.get(`/departments/${deptId}`);
        const d = data?.data ?? data;
        const info: DepartmentInfo = {
          id:          d.id,
          name:        d.name,
          description: d.description ?? "",
          accentHex:   deptInfoCache[deptId]?.accentHex ?? PALETTE[0],
        };
        deptInfoCache[deptId] = info;
        setDeptInfo(info);
        return;
      } catch {
        // Fall back to list
      }

      const { data } = await api.get("/departments/list");
      const raw      = parseList(data);
      const idx      = raw.findIndex((d: any) => d.id === deptId);
      if (idx >= 0) {
        const info: DepartmentInfo = {
          id:          raw[idx].id,
          name:        raw[idx].name,
          description: raw[idx].description ?? "",
          accentHex:   accentFor(idx),
        };
        deptInfoCache[deptId] = info;
        setDeptInfo(info);
      }
    } catch { /* non-critical */ }
  }, [deptId]);

  // ── Fetch members ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (force = false) => {
      if (!deptId) return;
      if (
        !force &&
        membersCache[deptId] &&
        Date.now() - membersCache[deptId].ts < CACHE_TTL
      ) {
        setUsers(membersCache[deptId].users);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await api.get(`/departments/${deptId}/members`);
        const mapped: User[] = parseList(data).map((u: any) => ({
          id:     u.id,
          name:   u.name ?? u.full_name ?? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
          email:  u.email ?? "",
          phone:  u.phone ?? u.phone_number ?? undefined,
          role:   u.role ?? u.job_title ?? "",
          status: u.status === "active" || u.is_active === true ? "active" : "inactive",
        }));
        setUsers(mapped);
        membersCache[deptId] = { users: mapped, ts: Date.now() };
      } catch {
        showToast("Failed to load users", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [deptId, showToast],
  );

  // Fire both fetches in parallel
  useEffect(() => {
    if (!deptId) return;
    fetchDeptInfo();
    fetchUsers();
  }, [deptId, fetchDeptInfo, fetchUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const currentMemberIds = useMemo(() => new Set(users.map(u => u.id)), [users]);

  if (!deptId) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/40 text-sm">Invalid department ID.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center"
          >
            <RefreshIcon /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: accentHex, color: "#fff" }}
          >
            <UsersAddIcon /> Assign Users
          </button>
        </div>
      </div>

      {/* Stat chip */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${accentHex}30`, background: `${accentHex}10` }}
          >
            <span className="font-bold text-sm" style={{ color: accentHex }}>
              {users.length}
            </span>
            <span className="text-white/50 text-xs">Total Members</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-white/30 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <p className="gv-eyebrow">
        {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "user" : "users"}`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-white/40 text-sm">
            {search ? "No users match your search." : "No users in this department yet."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowAssign(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mx-auto transition-all"
              style={{
                background: `${accentHex}22`,
                border:     `1px solid ${accentHex}44`,
                color:      accentHex,
              }}
            >
              <UsersAddIcon /> Assign first user
            </button>
          )}
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

      {detailUser && (
        <UserSheet
          user={detailUser}
          accentHex={accentHex}
          onClose={() => setDetailUser(null)}
        />
      )}

      {showAssign && (
        <AssignUsersModal
          deptId={deptId}
          accentHex={accentHex}
          currentMemberIds={currentMemberIds}
          onClose={() => setShowAssign(false)}
          onAssigned={() => fetchUsers(true)}
          showToast={showToast}
        />
      )}
    </div>
  );
}