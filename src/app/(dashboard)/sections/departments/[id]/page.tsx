"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import {
  type Menu,
  type User,
  type Department,
  getCachedDepartment,
  getCachedMenus,
  setCachedMenus,
  getCachedUsers,
  setCachedUsers,
  getDeptCache,
  setDeptCache,
} from "@/lib/departments-cache";


interface DeptDetail { id: number; name: string; description?: string; }


function extractArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  const probes: unknown[] = [
    d?.data,
    (d?.data as any)?.items,
    (d?.data as any)?.data,
    (d?.data as any)?.results,
    d?.items,
    d?.results,
    d?.list,
    d?.records,
    d?.rows,
    d?.menus,
    d?.users,
    d?.members,
    d?.departments,
  ];
  for (const p of probes) {
    if (Array.isArray(p) && p.length > 0) return p as any[];
  }
  for (const key of Object.keys(d)) {
    if (Array.isArray(d[key])) return d[key] as any[];
  }
  return [];
}

function toMenu(m: any): Menu {
  return {
    id:    Number(m.id ?? m.menu_id ?? m.menuId ?? 0),
    name:  String(m.name ?? m.menu_name ?? ""),
    title: String(m.title ?? m.label ?? m.name ?? m.menu_name ?? ""),
    link:  m.link ?? m.url ?? m.path ?? undefined,
  };
}


function toUser(u: any): User {
  const src = u?.user ?? u?.member ?? u;
  return {
    id:    Number(src.id ?? src.user_id ?? src.userId ?? u.user_id ?? u.userId ?? u.id ?? 0),
    name:  String(
      (src.name ?? src.full_name ?? src.fullName ??
      `${src.first_name ?? src.firstName ?? ""} ${src.last_name ?? src.lastName ?? ""}`.trim()) ||
      "Unknown"
    ),
    email: String(src.email ?? src.email_address ?? u.email ?? ""),
    role:  String(src.role ?? src.job_title ?? src.jobTitle ?? src.position ?? src.phone ?? u.role ?? ""),
  };
}

function parseMenus(raw: unknown): Menu[] {
  const arr = extractArray(raw);
  return arr.map(toMenu).filter(m => m.id > 0);
}

function parseUsers(raw: unknown, tag = ""): User[] {
  const arr = extractArray(raw);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[parseUsers${tag ? " " + tag : ""}] raw sample:`, JSON.stringify(arr[0]).slice(0, 300));
    console.log(`[parseUsers${tag ? " " + tag : ""}] → array len:`, arr.length);
  }
  return arr.map(toUser).filter(u => u.id > 0);
}


function syncDeptListCounts(deptId: number, counts: Partial<Pick<Department, "menusCount" | "usersCount">>) {
  const cache = getDeptCache();
  if (!cache) return;
  const updated = cache.map(d => (d.id === deptId ? { ...d, ...counts } : d));
  setDeptCache(updated);
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white
      text-sm font-semibold z-[60] shadow-xl pointer-events-none
      ${type === "success" ? "bg-[#33907c]" : "bg-red-600"}`}
    >{message}</div>
  );
}


const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
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
const MenusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);


function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh", animation: "fadeUp 0.2s ease" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-bold text-base">{title}</h2>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}


function EmptyState({ icon, label, action }: { icon: React.ReactNode; label: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {icon}
      </div>
      <p className="text-white/30 text-sm">{label}</p>
      {action}
    </div>
  );
}

// ─── Selectable list item ─────────────────────────────────────────────────────
function SelectRow({ isSelected, onClick, children }: {
  isSelected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all select-none"
      style={{
        background: isSelected ? "color-mix(in srgb, var(--gv-brand) 14%, transparent)" : "rgba(255,255,255,0.04)",
        border: isSelected ? "1px solid color-mix(in srgb, var(--gv-brand) 45%, transparent)" : "1px solid rgba(255,255,255,0.08)",
      }}>
      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
        style={{ background: isSelected ? "var(--gv-brand)" : "rgba(255,255,255,0.08)", border: isSelected ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
        {isSelected && <CheckIcon />}
      </div>
      {children}
    </div>
  );
}


function AssignMenuModal({ deptId, currentMenuIds, onClose, onAssigned, showToast }: {
  deptId: number; currentMenuIds: Set<number>;
  onClose: () => void; onAssigned: (menus: Menu[]) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loading, setLoading]   = useState(true);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/menus/list")
      .then(res => {
        if (cancelled) return;
        const parsed = parseMenus(res.data);
        if (parsed.length === 0) {
          setErrMsg(`Menus API returned 0 items. Raw: ${JSON.stringify(res.data).slice(0, 200)}`);
        }
        setAllMenus(parsed);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = `${err?.response?.status ?? "Network error"}: ${JSON.stringify(err?.response?.data ?? err?.message).slice(0, 150)}`;
        console.error("[AssignMenuModal] /menus/list failed:", msg);
        setErrMsg(msg);
        showToast("Failed to load menus", "error");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const available = useMemo(() =>
    allMenus.filter(m => !currentMenuIds.has(m.id))
      .filter(m => (m.title || m.name).toLowerCase().includes(search.toLowerCase())),
    [allMenus, search, currentMenuIds]);

  const toggle = (id: number) =>
    setSelected(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleAssign = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const ids = [...selected];
      await api.post(`/departments/${deptId}/menus`, { menu_ids: ids });
      onAssigned(allMenus.filter(m => selected.has(m.id)));
      showToast(`${selected.size} menu${selected.size > 1 ? "s" : ""} assigned`, "success");
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.response?.data;
      const msg = typeof detail === "string" ? detail : JSON.stringify(detail).slice(0, 120);
      console.error("[AssignMenuModal] assign failed:", err?.response?.status, err?.response?.data);
      showToast(msg || "Failed to assign menus", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Assign Menus" onClose={onClose}>
      <div className="px-6 pt-3 pb-2 shrink-0">
        <div className="gv-input flex items-center gap-2 py-2 px-3">
          <SearchIcon />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menus…"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30" />
          {search && <button type="button" onClick={() => setSearch("")} className="text-white/30 hover:text-white"><CloseIcon /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
        ) : errMsg ? (
          <div className="px-4 py-4 rounded-xl space-y-1.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-red-400 text-sm font-semibold">Could not load menus</p>
            <p className="text-red-300/60 text-xs font-mono break-all">{errMsg}</p>
          </div>
        ) : available.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">
            {allMenus.filter(m => !currentMenuIds.has(m.id)).length === 0 ? "All menus already assigned." : "No menus match."}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-white/40 text-xs">{available.length} available</span>
              <button type="button"
                onClick={() => selected.size === available.length ? setSelected(new Set()) : setSelected(new Set(available.map(m => m.id)))}
                className="text-xs font-semibold" style={{ color: "var(--gv-brand)" }}>
                {selected.size === available.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            {available.map(menu => (
              <SelectRow key={menu.id} isSelected={selected.has(menu.id)} onClick={() => toggle(menu.id)}>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{menu.title || menu.name}</p>
                  {menu.link && <p className="text-white/35 text-xs truncate mt-0.5">{menu.link}</p>}
                </div>
              </SelectRow>
            ))}
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <button type="button" onClick={onClose} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
        <button type="button" onClick={handleAssign} disabled={selected.size === 0 || saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "var(--gv-brand)", color: "#fff" }}>
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? "Assigning…" : selected.size > 0 ? `Assign ${selected.size} Menu${selected.size > 1 ? "s" : ""}` : "Assign"}
        </button>
      </div>
    </Modal>
  );
}


function AssignUserModal({ deptId, currentUserIds, onClose, onAssigned, showToast }: {
  deptId: number; currentUserIds: Set<number>;
  onClose: () => void; onAssigned: (users: User[]) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/users/list")
      .then(res => {
        if (cancelled) return;
        const parsed = parseUsers(res.data, "/users/list");
        if (parsed.length === 0) {
          setErrMsg(`Users API returned 0 items. Raw keys: ${Object.keys(res.data ?? {}).join(", ")}. Sample: ${JSON.stringify(res.data).slice(0, 250)}`);
        }
        setAllUsers(parsed);
      })
      .catch(err => {
        if (cancelled) return;
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.response?.data;
        const msg    = `HTTP ${status ?? "network error"}: ${JSON.stringify(detail ?? err?.message).slice(0, 150)}`;
        console.error("[AssignUserModal] /users/list failed:", msg);
        setErrMsg(msg);
        showToast(`Failed to load users (${status ?? "network error"})`, "error");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const available = useMemo(() =>
    allUsers.filter(u => !currentUserIds.has(u.id))
      .filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())),
    [allUsers, search, currentUserIds]);

  const toggle = (id: number) =>
    setSelected(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleAssign = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const ids = [...selected];
      await api.post(`/departments/${deptId}/assign-users`, { user_ids: ids });
      onAssigned(allUsers.filter(u => selected.has(u.id)));
      showToast(`${selected.size} user${selected.size > 1 ? "s" : ""} assigned`, "success");
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.response?.data;
      const msg = typeof detail === "string" ? detail : JSON.stringify(detail).slice(0, 120);
      console.error("[AssignUserModal] assign failed:", err?.response?.status, err?.response?.data);
      showToast(msg || "Failed to assign users", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Assign Users" onClose={onClose}>
      <div className="px-6 pt-3 pb-2 shrink-0">
        <div className="gv-input flex items-center gap-2 py-2 px-3">
          <SearchIcon />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30" />
          {search && <button type="button" onClick={() => setSearch("")} className="text-white/30 hover:text-white"><CloseIcon /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
        ) : errMsg ? (
          <div className="px-4 py-4 rounded-xl space-y-1.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-red-400 text-sm font-semibold">Could not load users</p>
            <p className="text-red-300/60 text-xs font-mono break-all">{errMsg}</p>
            <p className="text-white/25 text-xs mt-1">Share this message so the parser can be fixed.</p>
          </div>
        ) : available.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">
            {allUsers.filter(u => !currentUserIds.has(u.id)).length === 0 ? "All users already assigned." : "No users match."}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-white/40 text-xs">{available.length} available</span>
              <button type="button"
                onClick={() => selected.size === available.length ? setSelected(new Set()) : setSelected(new Set(available.map(u => u.id)))}
                className="text-xs font-semibold" style={{ color: "var(--gv-brand)" }}>
                {selected.size === available.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            {available.map(user => {
              const inits = user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <SelectRow key={user.id} isSelected={selected.has(user.id)} onClick={() => toggle(user.id)}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: selected.has(user.id) ? "color-mix(in srgb, var(--gv-brand) 25%, transparent)" : "rgba(255,255,255,0.08)",
                      color: selected.has(user.id) ? "var(--gv-brand)" : "rgba(255,255,255,0.5)",
                    }}>
                    {inits}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-white/40 text-xs truncate">{user.role || user.email}</p>
                  </div>
                </SelectRow>
              );
            })}
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <button type="button" onClick={onClose} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
        <button type="button" onClick={handleAssign} disabled={selected.size === 0 || saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "var(--gv-brand)", color: "#fff" }}>
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? "Assigning…" : selected.size > 0 ? `Assign ${selected.size} User${selected.size > 1 ? "s" : ""}` : "Assign"}
        </button>
      </div>
    </Modal>
  );
}


export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deptId = Number(params?.id);

  const [dept, setDept] = useState<DeptDetail | null>(() => {
    const cached = getCachedDepartment(deptId);
    if (cached) return { id: cached.id, name: cached.name, description: cached.description };
    const fromList = getDeptCache()?.find(d => d.id === deptId);
    return fromList ? { id: fromList.id, name: fromList.name, description: fromList.description } : null;
  });

 
  const [menus, setMenus] = useState<Menu[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [removingMenuId, setRemovingMenuId] = useState<number | null>(null);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  
  const load = useCallback(async (silent = false) => {
    if (!deptId) return;
    if (!silent) {
      setMenusLoading(true);
      setUsersLoading(true);
    }

    
    const menusReq = api.get(`/departments/${deptId}/menus`).catch(e => {
      console.warn("[load] dept menus failed:", e?.response?.status, e?.response?.data);
      return null;
    });
   
    const membersReq = api.get(`/departments/${deptId}/members`).catch(e => {
      console.warn("[load] members failed:", e?.response?.status, e?.response?.data);
      return null;
    });

    menusReq.then(res => {
      if (!res) { setMenusLoading(false); return; }
      console.log("[menus] full raw response:", JSON.stringify(res.data));
      const parsed = parseMenus(res.data);
      console.log("[menus] parsed:", JSON.stringify(parsed));
      setMenus(parsed);
      setCachedMenus(deptId, parsed);
      syncDeptListCounts(deptId, { menusCount: parsed.length });
      setMenusLoading(false);
    });

    membersReq.then(res => {
      if (!res) { setUsersLoading(false); return; }
      // Always log so we can diagnose
      console.log("[members] full raw response:", JSON.stringify(res.data));
      const arr = extractArray(res.data);
      console.log("[members] extractArray result:", JSON.stringify(arr));
      if (arr[0]) console.log("[members] first item keys:", Object.keys(arr[0]), "value:", JSON.stringify(arr[0]));
      const resolved = parseUsers(res.data, "/members");
      console.log("[members] parsed users:", JSON.stringify(resolved));
      setUsers(resolved);
      setCachedUsers(deptId, resolved);
      syncDeptListCounts(deptId, { usersCount: resolved.length });
      setUsersLoading(false);
    });
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  // ── Remove menu — optimistic update then re-fetch to confirm
  const removeMenu = async (menu: Menu) => {
    setRemovingMenuId(menu.id);
    try {
      await api.delete(`/departments/${deptId}/menus`, {
        data: { menu_ids: [menu.id] },
      });
      // Optimistic: remove immediately from UI
      setMenus(prev => {
        const updated = prev.filter(m => m.id !== menu.id);
        setCachedMenus(deptId, updated);
        syncDeptListCounts(deptId, { menusCount: updated.length });
        return updated;
      });
      showToast(`"${menu.title || menu.name}" removed`, "success");
     
      load(true);
    } catch (err: any) {
      console.error("[removeMenu] failed:", err?.response?.status, err?.response?.data);
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
      showToast(typeof detail === "string" ? detail : "Failed to remove menu", "error");
      
      load(true);
    } finally {
      setRemovingMenuId(null);
    }
  };

  // ── Remove user
  const removeUser = async (user: User) => {
    setRemovingUserId(user.id);
    const attempts: Array<() => Promise<unknown>> = [
      () => api.delete(`/departments/${deptId}/members`, { data: { user_ids: [user.id] } }),
      () => api.delete(`/departments/${deptId}/users`, { data: { user_ids: [user.id] } }),
      () => api.post(`/departments/${deptId}/members/remove`, { user_ids: [user.id] }),
    ];

    let lastErr: any = null;
    for (const attempt of attempts) {
      try {
        await attempt();
        setUsers(prev => {
          const updated = prev.filter(u => u.id !== user.id);
          setCachedUsers(deptId, updated);
          syncDeptListCounts(deptId, { usersCount: updated.length });
          return updated;
        });
        showToast(`"${user.name}" removed`, "success");
        setRemovingUserId(null);
        load(true);
        return;
      } catch (err: any) {
        lastErr = err;
        const status = err?.response?.status;
        if (status !== 404 && status !== 405) break;
      }
    }

    console.error("[removeUser] all attempts failed:", lastErr?.response?.status, lastErr?.response?.data);
    const detail = lastErr?.response?.data?.detail ?? lastErr?.response?.data?.message;
    showToast(typeof detail === "string" ? detail : "Failed to remove user — endpoint needs confirming", "error");
    load(true);
    setRemovingUserId(null);
  };

  const assignedMenuIds = useMemo(() => new Set(menus.map(m => m.id)), [menus]);
  const assignedUserIds = useMemo(() => new Set(users.map(u => u.id)), [users]);

  const handleMenusAssigned = useCallback((newMenus: Menu[]) => {
    setMenus(prev => {
      const existing = new Set(prev.map(m => m.id));
      const updated = [...prev, ...newMenus.filter(m => !existing.has(m.id))];
      setCachedMenus(deptId, updated);
      syncDeptListCounts(deptId, { menusCount: updated.length });
      return updated;
    });
   
    load(true);
  }, [deptId, load]);

  const handleUsersAssigned = useCallback((newUsers: User[]) => {
    setUsers(prev => {
      const existing = new Set(prev.map(u => u.id));
      const updated = [...prev, ...newUsers.filter(u => !existing.has(u.id))];
      setCachedUsers(deptId, updated);
      syncDeptListCounts(deptId, { usersCount: updated.length });
      return updated;
    });
    // Re-fetch to get full user objects from the server
    load(true);
  }, [deptId, load]);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.push("/sections/departments")}
            className="gv-btn-outline w-9 h-9 flex items-center justify-center p-0 shrink-0">
            <BackIcon />
          </button>
          <div>
            <p className="gv-eyebrow mb-0.5">Departments</p>
            {dept
              ? <h1 className="text-white text-2xl font-bold leading-tight">{dept.name}</h1>
              : <div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" />}
            {dept?.description && <p className="text-white/40 text-sm mt-1">{dept.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button type="button" onClick={() => load(false)}
            className="gv-btn-outline w-9 h-9 flex items-center justify-center p-0" title="Refresh">
            <RefreshIcon />
          </button>
          <button type="button" onClick={() => setShowAssignMenu(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.7)" }}>
            <PlusIcon /> Assign Menu
          </button>
          <button type="button" onClick={() => setShowAssignUser(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gv-brand)", color: "#fff" }}>
            <PlusIcon /> Assign User
          </button>
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Menus column */}
        <div className="gv-card p-0 overflow-hidden flex flex-col" style={{ minHeight: 360 }}>
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.07]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <MenusIcon />
            </div>
            <span className="text-white font-semibold text-sm">Menus</span>
            {!menusLoading && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold text-white/40"
                style={{ background: "rgba(255,255,255,0.07)" }}>{menus.length}</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menusLoading ? (
              [1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
            ) : menus.length === 0 ? (
              <EmptyState icon={<MenusIcon />} label="No menus assigned yet"
                action={
                  <button type="button" onClick={() => setShowAssignMenu(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <PlusIcon /> Assign a menu
                  </button>
                } />
            ) : menus.map(menu => (
              <div key={menu.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white/30"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <MenusIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{menu.title || menu.name}</p>
                  {menu.link && (
                    <p className="text-white/35 text-xs truncate mt-0.5 flex items-center gap-1">
                      <LinkIcon />{menu.link}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => removeMenu(menu)}
                  disabled={removingMenuId === menu.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                  {removingMenuId === menu.id ? <SpinnerIcon size={11} /> : <MinusIcon />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Users column */}
        <div className="gv-card p-0 overflow-hidden flex flex-col" style={{ minHeight: 360 }}>
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.07]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <UsersIcon />
            </div>
            <span className="text-white font-semibold text-sm">Users</span>
            {!usersLoading && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold text-white/40"
                style={{ background: "rgba(255,255,255,0.07)" }}>{users.length}</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {usersLoading ? (
              [1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
            ) : users.length === 0 ? (
              <EmptyState icon={<UsersIcon />} label="No users assigned yet"
                action={
                  <button type="button" onClick={() => setShowAssignUser(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <PlusIcon /> Assign a user
                  </button>
                } />
            ) : users.map(user => {
              const inits = user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={user.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                    {inits}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-white/40 text-xs truncate">{user.role || user.email}</p>
                  </div>
                  <button type="button" onClick={() => removeUser(user)}
                    disabled={removingUserId === user.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                    {removingUserId === user.id ? <SpinnerIcon size={11} /> : <MinusIcon />}
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {showAssignMenu && (
        <AssignMenuModal deptId={deptId} currentMenuIds={assignedMenuIds}
          onClose={() => setShowAssignMenu(false)} onAssigned={handleMenusAssigned} showToast={showToast} />
      )}
      {showAssignUser && (
        <AssignUserModal deptId={deptId} currentUserIds={assignedUserIds}
          onClose={() => setShowAssignUser(false)} onAssigned={handleUsersAssigned} showToast={showToast} />
      )}
    </div>
  );
}