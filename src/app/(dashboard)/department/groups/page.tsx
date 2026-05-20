"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

interface Group {
  id: number;
  refId?: string;
  name: string;
  description: string;
  colorClass: string;
  accentHex: string;
  members?: Member[];
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  { label: "Navy",   accentHex: "#3B5BDB", colorClass: "bg-[#3B5BDB]" },
  { label: "Teal",   accentHex: "#0E7C5E", colorClass: "bg-[#0E7C5E]" },
  { label: "Amber",  accentHex: "#B45309", colorClass: "bg-[#B45309]" },
  { label: "Purple", accentHex: "#6D28D9", colorClass: "bg-[#6D28D9]" },
  { label: "Red",    accentHex: "#B91C1C", colorClass: "bg-[#B91C1C]" },
  { label: "Sky",    accentHex: "#0369A1", colorClass: "bg-[#0369A1]" },
];

// Assign palette colours by index so each department gets a consistent colour
function paletteForIndex(index: number) {
  return PALETTE[index % PALETTE.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

// ─── Dialog ───────────────────────────────────────────────────────────────────
function Dialog({ title, onClose, children, actions }: {
  title: string; onClose: () => void;
  children: React.ReactNode; actions: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="gv-card w-full max-w-sm mx-4 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-white font-semibold text-sm">{title}</span>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>
        <div className="px-5 pt-4 pb-2">{children}</div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-2">{actions}</div>
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="gv-label">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="gv-input text-sm"
      />
    </div>
  );
}

// ─── Group Detail Bottom Sheet ────────────────────────────────────────────────
function GroupDetailSheet({ group, members, membersLoading, onClose, onEdit, onDelete }: {
  group: Group;
  members: Member[];
  membersLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [membersOpen, setMembersOpen] = useState(true);
  const activeCount = members.filter(u => u.status === "active").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-t-2xl flex flex-col"
        style={{ maxHeight: "85vh", animation: "slideUp 0.22s ease" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className={`${group.colorClass} px-4 py-3 flex items-center gap-3 shrink-0`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <UsersIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base">{group.name}</p>
            <p className="text-white/60 text-xs truncate">{group.description}</p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-white font-bold text-xl leading-none">{members.length}</p>
            <p className="text-white/60 text-xs">members</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { icon: "🏷️", label: "Group Name",  value: group.name },
            { icon: "📝", label: "Description", value: group.description },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-sm">{r.icon}</span>
                <span className="text-white/50 text-xs font-medium">{r.label}</span>
              </div>
              <span className="text-white text-xs font-semibold max-w-[180px] truncate text-right">{r.value}</span>
            </div>
          ))}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg leading-none">{members.length}</p>
              <p className="text-white/40 text-xs mt-1">Total</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-green-400 font-bold text-lg leading-none">{activeCount}</p>
              <p className="text-white/40 text-xs mt-1">Active</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-white/50 font-bold text-lg leading-none">{members.length - activeCount}</p>
              <p className="text-white/40 text-xs mt-1">Inactive</p>
            </div>
          </div>

          {/* Members accordion */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setMembersOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UsersIcon />
                <span className="text-white font-semibold text-sm">Members</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{members.length}</span>
              </div>
              <ChevronIcon open={membersOpen} />
            </button>

            {membersOpen && (
              <div className="p-2 space-y-1.5">
                {membersLoading ? (
                  <div className="space-y-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-3">No members yet</p>
                ) : (
                  members.map(u => (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                        style={{ background: group.accentHex }}
                      >
                        {initials(u.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{u.name}</p>
                        <p className="text-white/40 text-xs truncate">{u.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        u.status === "active"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-white/10 text-white/40"
                      }`}>
                        {u.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-2 space-y-2 shrink-0 border-t border-white/10">
          <div className="flex gap-2">
            <button onClick={() => { onClose(); onEdit(); }} className="gv-btn-outline flex-1 justify-center text-sm py-2.5 gap-2">
              <EditIcon /> Edit
            </button>
            <button onClick={() => { onClose(); onDelete(); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
              <TrashIcon /> Delete
            </button>
          </div>
          <button onClick={onClose} className="gv-btn-outline w-full justify-center text-sm py-2.5">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group, onTap, onEdit, onDelete }: {
  group: Group;
  onTap: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const members = group.members ?? [];
  const activeCount = members.filter(u => u.status === "active").length;

  return (
    <div
      onClick={onTap}
      className="gv-card gv-card-hover p-0 overflow-hidden flex flex-col cursor-pointer"
    >
      <div className={`${group.colorClass} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <UsersIcon />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">{group.name}</p>
            <p className="text-white/60 text-xs truncate max-w-[130px]">{group.description}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all">
            <EditIcon />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-red-300/70 hover:text-red-300 hover:bg-red-500/20 transition-all">
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
          <p className="text-white font-bold text-base leading-none">{members.length}</p>
          <p className="text-white/40 text-xs mt-1">Total</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
          <p className="text-green-400 font-bold text-base leading-none">{activeCount}</p>
          <p className="text-white/40 text-xs mt-1">Active</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
          <p className="text-white/50 font-bold text-base leading-none">{members.length - activeCount}</p>
          <p className="text-white/40 text-xs mt-1">Inactive</p>
        </div>
      </div>

      <div className="px-3 pb-3 flex items-center justify-between">
        <div className="flex">
          {members.slice(0, 4).map((u, i) => (
            <div key={u.id}
              className="w-7 h-7 rounded-full border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: group.accentHex, marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i, position: "relative" }}
            >
              {initials(u.name)}
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-white/10 bg-white/10 flex items-center justify-center text-xs font-bold text-white/50"
              style={{ marginLeft: -8, position: "relative", zIndex: 0 }}>
              +{members.length - 4}
            </div>
          )}
          {members.length === 0 && (
            <span className="text-white/30 text-xs">No members</span>
          )}
        </div>
        <span className="text-white/50 text-xs font-medium hover:text-white/70 transition-colors">
          View members →
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [detailTarget, setDetailTarget] = useState<Group | null>(null);
  const [detailMembers, setDetailMembers] = useState<Member[]>([]);
  const [detailMembersLoading, setDetailMembersLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Group | null>(null);

  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fColorIdx, setFColorIdx] = useState(0);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => { setFName(""); setFDesc(""); setFColorIdx(0); };

  // ── Fetch departments ───────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/departments/list");
      const raw: any[] = data?.items ?? data?.data ?? data ?? [];

      const mapped: Group[] = raw.map((dept: any, idx: number) => {
        const pal = paletteForIndex(idx);
        return {
          id: dept.id,
          name: dept.name,
          description: dept.description ?? "",
          colorClass: pal.colorClass,
          accentHex: pal.accentHex,
          members: [],
        };
      });

      setGroups(mapped);
    } catch {
      showToast("Failed to load groups", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // ── Fetch members for a department ─────────────────────────────────────────
  const fetchMembers = useCallback(async (deptId: number) => {
    try {
      setDetailMembersLoading(true);
      const { data } = await api.get(`/departments/${deptId}/members`);
      const raw: any[] = data?.items ?? data?.data ?? data ?? [];
      const members: Member[] = raw.map((m: any) => ({
        id: m.id,
        name: m.name ?? m.full_name ?? `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim(),
        email: m.email ?? "",
        role: m.role ?? m.job_title ?? "",
        status: m.status === "active" || m.is_active ? "active" : "inactive",
      }));
      setDetailMembers(members);
    } catch {
      setDetailMembers([]);
    } finally {
      setDetailMembersLoading(false);
    }
  }, []);

  const openDetail = (group: Group) => {
    setDetailTarget(group);
    setDetailMembers([]);
    fetchMembers(group.id);
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!fName.trim()) return;
    try {
      setIsSaving(true);
      await api.post("/departments/create", {
        name: fName,
        description: fDesc,
      });
      showToast("Group created successfully", "success");
      setAddOpen(false);
      resetForm();
      fetchGroups();
    } catch {
      showToast("Failed to create group", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editTarget || !fName.trim()) return;
    try {
      setIsSaving(true);
      await api.patch(`/departments/${editTarget.id}`, {
        name: fName,
        description: fDesc,
      });
      showToast("Group updated successfully", "success");
      setEditTarget(null);
      resetForm();
      fetchGroups();
    } catch {
      showToast("Failed to update group", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (group: Group) => {
    setFName(group.name);
    setFDesc(group.description);
    const idx = groups.findIndex(g => g.id === group.id);
    setFColorIdx(idx >= 0 ? idx % PALETTE.length : 0);
    setEditTarget(group);
  };

  // ── Delete — uses deletion-request flow ─────────────────────────────────────
  // The backend requires a deletion request + approval flow (DIRECTOR role).
  // Here we submit a deletion request. If your backend auto-approves for DIRECTOR
  // you can chain the approval call, or simply reflect the pending state.
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsSaving(true);
      await api.post(`/departments/${deleteTarget.id}/deletion-requests`, {
        reason: "Deleted via admin panel",
      });
      showToast("Deletion request submitted", "success");
      setDeleteTarget(null);
      fetchGroups();
    } catch {
      showToast("Failed to submit deletion request", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    groups.filter(g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
    ), [groups, search]);

  const FormContent = () => (
    <>
      <FormField label="Group Name"  value={fName} onChange={setFName} placeholder="e.g. Logistics" />
      <FormField label="Description" value={fDesc} onChange={setFDesc} placeholder="e.g. Fleet and logistics operations" />
      <div className="mb-3">
        <label className="gv-label">Color Theme</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {PALETTE.map((p, i) => (
            <button key={i} onClick={() => setFColorIdx(i)} title={p.label}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: p.accentHex,
                outline: i === fColorIdx ? `3px solid white` : "3px solid transparent",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
        <p className="text-white/40 text-xs mt-2">Selected: {PALETTE[fColorIdx].label}</p>
      </div>
    </>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow mb-1">Department</p>
          <h1 className="text-white text-2xl font-bold">Groups</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchGroups} className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center">
            <RefreshIcon /> Refresh
          </button>
          <button onClick={() => { resetForm(); setAddOpen(true); }} className="gv-btn-brand px-4 py-2 text-sm gap-2">
            <PlusIcon /> Add Group
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search groups..."
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map(g => (
          <button key={g.id} onClick={() => openDetail(g)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.accentHex }} />
            <span className="text-white/70 text-xs font-medium">{g.name}</span>
          </button>
        ))}
      </div>

      {/* Count label */}
      <p className="gv-eyebrow">All Groups {!isLoading && `(${filtered.length})`}</p>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="gv-card h-44 animate-pulse p-0 overflow-hidden">
              <div className="h-14 bg-white/5" />
              <div className="p-3 space-y-2">
                {[1, 2].map(j => <div key={j} className="h-8 bg-white/5 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-white/40 text-sm">
            {search ? "No groups match your search." : "No groups yet. Click 'Add Group' to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filtered.map(group => (
            <GroupCard key={group.id} group={group}
              onTap={() => openDetail(group)}
              onEdit={() => openEdit(group)}
              onDelete={() => setDeleteTarget(group)}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Add Dialog ── */}
      {addOpen && (
        <Dialog title="Add Group" onClose={() => setAddOpen(false)} actions={
          <>
            <button onClick={() => setAddOpen(false)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={isSaving} className="gv-btn-brand px-4 py-2 text-sm">
              {isSaving ? "Saving…" : "Add"}
            </button>
          </>
        }>
          <FormContent />
        </Dialog>
      )}

      {/* ── Edit Dialog ── */}
      {editTarget && (
        <Dialog title={`Edit — ${editTarget.name}`} onClose={() => setEditTarget(null)} actions={
          <>
            <button onClick={() => setEditTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleEdit} disabled={isSaving} className="gv-btn-brand px-4 py-2 text-sm">
              {isSaving ? "Saving…" : "Save"}
            </button>
          </>
        }>
          <FormContent />
        </Dialog>
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <Dialog title="Submit Deletion Request" onClose={() => setDeleteTarget(null)} actions={
          <>
            <button onClick={() => setDeleteTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              {isSaving ? "Submitting…" : "Submit Request"}
            </button>
          </>
        }>
          <p className="text-white/70 text-sm">
            Submit a deletion request for group <strong className="text-white">'{deleteTarget.name}'</strong>?
            <span className="block mt-2 text-yellow-400/80 text-xs">
              ⚠️ This will go through the approval workflow before the group is permanently removed.
            </span>
          </p>
        </Dialog>
      )}

      {/* ── Detail Sheet ── */}
      {detailTarget && (
        <GroupDetailSheet
          group={detailTarget}
          members={detailMembers}
          membersLoading={detailMembersLoading}
          onClose={() => setDetailTarget(null)}
          onEdit={() => openEdit(detailTarget)}
          onDelete={() => setDeleteTarget(detailTarget)}
        />
      )}
    </div>
  );
}