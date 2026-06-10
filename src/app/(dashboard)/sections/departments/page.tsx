"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Menu { id: number; name: string; title: string; link?: string; }
interface UserItem { id: number; name: string; email: string; role: string; }
interface Department {
  id: number; name: string; description: string;
  accentHex: string; menus: Menu[]; menusLoading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PALETTE = ["#3B5BDB","#0E7C5E","#B45309","#6D28D9","#B91C1C","#0369A1"];
const accentFor = (i: number) => PALETTE[i % PALETTE.length];
const CACHE_TTL = 5 * 60 * 1000;

// ─── Module-level cache ───────────────────────────────────────────────────────
let deptCache: Department[] | null = null;
let cacheTs = 0;

// ─── Bust cache helper (exported so other modules can call it) ────────────────
export function bustDeptCache() {
  deptCache = null;
  cacheTs   = 0;
}

// ─── Shared response parser ───────────────────────────────────────────────────
// Handles the most common FastAPI envelope shapes in one place.
export function parseList(data: unknown): any[] {
  if (Array.isArray(data))                          return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray((d.data as any)?.items))      return (d.data as any).items;
    if (Array.isArray(d.data))                      return d.data as any[];
    if (Array.isArray(d.items))                     return d.items as any[];
    if (Array.isArray(d.results))                   return d.results as any[];
  }
  return [];
}

// ─── Parse menus from ANY envelope shape the backend might return ─────────────
function parseMenuList(data: unknown): Menu[] {
  const raw = parseList(data);
  return raw.map((m: any) => ({
    id:    Number(m.id ?? m.menu_id ?? 0),
    name:  String(m.name ?? ""),
    title: String(m.title ?? m.name ?? ""),
    link:  m.link ?? undefined,
  })).filter(m => m.id > 0);
}

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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const MenusIcon = () => (
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
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const SpinnerIcon = ({ size = 14 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── Manage Modal ─────────────────────────────────────────────────────────────
function ManageModal({
  dept, onClose, onMenusChanged, showToast,
}: {
  dept: Department;
  onClose: () => void;
  onMenusChanged: (deptId: number, menus: Menu[]) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [activeTab, setActiveTab] = useState<"menus" | "users">("menus");

  // ── Menu state ──────────────────────────────────────────────────────────
  const [allMenus, setAllMenus]               = useState<Menu[]>([]);
  const [assignedMenuIds, setAssignedMenuIds] = useState<Set<number>>(new Set());
  const [menusLoading, setMenusLoading]       = useState(true);
  const [menuSearch, setMenuSearch]           = useState("");
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<number>>(new Set());
  const [menusSaving, setMenusSaving]         = useState(false);
  const [removingMenuIds, setRemovingMenuIds] = useState<Set<number>>(new Set());

  // ── User state ──────────────────────────────────────────────────────────
  const [allUsers, setAllUsers]               = useState<UserItem[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<Set<number>>(new Set());
  const [usersLoading, setUsersLoading]       = useState(true);
  const [userSearch, setUserSearch]           = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [usersSaving, setUsersSaving]         = useState(false);

  // ── Load menus + users in parallel on open ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadMenus = async () => {
      try {
        const [allRes, deptRes] = await Promise.all([
          api.get("/menus/list"),
          api.get(`/departments/${dept.id}/menus`),
        ]);
        if (cancelled) return;

        // Parse all available menus
        const all = parseMenuList(allRes.data);

        // Parse which menus are already assigned to this dept.
        // Be permissive — accept id, menu_id, or menuId field names.
        const rawAssigned = parseList(deptRes.data);
        const assignedIds = new Set<number>(
          rawAssigned
            .map((m: any) => Number(m.id ?? m.menu_id ?? m.menuId ?? 0))
            .filter((n: number) => n > 0)
        );

        // If the API returned nothing fall back to what the card already had
        const finalIds =
          assignedIds.size > 0
            ? assignedIds
            : new Set<number>(dept.menus.map(m => m.id));

        setAllMenus(all);
        setAssignedMenuIds(finalIds);
      } catch {
        if (!cancelled) {
          // Seed from card data so the modal isn't totally empty
          setAssignedMenuIds(new Set(dept.menus.map(m => m.id)));
          showToast("Failed to load menus", "error");
        }
      } finally {
        if (!cancelled) setMenusLoading(false);
      }
    };

    const loadUsers = async () => {
      try {
        const [allRes, membersRes] = await Promise.all([
          api.get("/users/list"),
          api.get(`/departments/${dept.id}/members`),
        ]);
        if (cancelled) return;

        const all = parseList(allRes.data).map((u: any) => ({
          id:    u.id,
          name:  u.name ?? u.full_name ?? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
          email: u.email ?? "",
          role:  u.role ?? u.job_title ?? "",
        }));
        const members = new Set<number>(
          parseList(membersRes.data).map((u: any) => Number(u.id ?? u.user_id ?? 0)).filter(Boolean)
        );
        setAllUsers(all);
        setAssignedUserIds(members);
      } catch {
        if (!cancelled) showToast("Failed to load users", "error");
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };

    loadMenus();
    loadUsers();

    return () => { cancelled = true; };
  }, [dept.id]); // intentionally omit dept.menus — seed only once on open

  // ── Menu toggle (only for unassigned menus) ─────────────────────────────
  const toggleMenuSelect = (id: number) => {
    if (assignedMenuIds.has(id)) return;
    setSelectedMenuIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── Assign selected menus ───────────────────────────────────────────────
  const assignSelectedMenus = async () => {
    if (selectedMenuIds.size === 0) return;
    setMenusSaving(true);
    try {
      await api.post(`/departments/${dept.id}/menus`, {
        menu_ids: [...selectedMenuIds],
      });

      const newAssigned = new Set([...assignedMenuIds, ...selectedMenuIds]);
      setAssignedMenuIds(newAssigned);
      setSelectedMenuIds(new Set());

      // Bust the module-level page cache so a refresh re-fetches from the API
      bustDeptCache();

      const updatedMenus = allMenus.filter(m => newAssigned.has(m.id));
      onMenusChanged(dept.id, updatedMenus);

      showToast(
        `${selectedMenuIds.size} menu${selectedMenuIds.size > 1 ? "s" : ""} assigned`,
        "success",
      );
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
      showToast(typeof detail === "string" ? detail : "Failed to assign menus", "error");
    } finally {
      setMenusSaving(false);
    }
  };

  // ── Remove a single assigned menu ───────────────────────────────────────
  // Strategy: try DELETE with body first; if the server returns 405/422/400
  // fall back to POST .../menus/remove which many backends prefer.
  const removeMenu = async (menu: Menu) => {
    setRemovingMenuIds(prev => new Set([...prev, menu.id]));
    try {
      let removed = false;

      // Attempt 1 — DELETE with JSON body
      try {
        await api.delete(`/departments/${dept.id}/menus`, {
          data: { menu_ids: [menu.id] },
        });
        removed = true;
      } catch (deleteErr: any) {
        const status = deleteErr?.response?.status;
        if (status === 405 || status === 422 || status === 400) {
          // Attempt 2 — POST to a /remove sub-path
          try {
            await api.post(`/departments/${dept.id}/menus/remove`, {
              menu_ids: [menu.id],
            });
            removed = true;
          } catch {
            // Attempt 3 — DELETE the menu by its ID directly in the path
            await api.delete(`/departments/${dept.id}/menus/${menu.id}`);
            removed = true;
          }
        } else {
          throw deleteErr;
        }
      }

      if (removed) {
        const newAssigned = new Set(assignedMenuIds);
        newAssigned.delete(menu.id);
        setAssignedMenuIds(newAssigned);

        // Bust cache so refresh fetches fresh data
        bustDeptCache();

        const updatedMenus = allMenus.filter(m => newAssigned.has(m.id));
        onMenusChanged(dept.id, updatedMenus);
        showToast(`"${menu.title || menu.name}" removed`, "success");
      }
    } catch {
      showToast("Failed to remove menu", "error");
    } finally {
      setRemovingMenuIds(prev => {
        const s = new Set(prev);
        s.delete(menu.id);
        return s;
      });
    }
  };

  // ── Assign selected users ───────────────────────────────────────────────
  const assignSelectedUsers = async () => {
    if (selectedUserIds.size === 0) return;
    setUsersSaving(true);
    try {
      await api.post(`/departments/${dept.id}/assign-users`, {
        user_ids: [...selectedUserIds],
      });
      setAssignedUserIds(prev => new Set([...prev, ...selectedUserIds]));
      showToast(
        `${selectedUserIds.size} user${selectedUserIds.size > 1 ? "s" : ""} assigned`,
        "success",
      );
      setSelectedUserIds(new Set());
    } catch {
      showToast("Failed to assign users", "error");
    } finally {
      setUsersSaving(false);
    }
  };

  // ── Filtered lists ──────────────────────────────────────────────────────
  const filteredMenus = useMemo(() =>
    allMenus.filter(m =>
      (m.title ?? m.name).toLowerCase().includes(menuSearch.toLowerCase())
    ),
    [allMenus, menuSearch],
  );

  const filteredUsers = useMemo(() =>
    allUsers.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
    ),
    [allUsers, userSearch],
  );

  const assignedMenus  = filteredMenus.filter(m =>  assignedMenuIds.has(m.id));
  const availableMenus = filteredMenus.filter(m => !assignedMenuIds.has(m.id));
  const availableUsers = filteredUsers.filter(u => !assignedUserIds.has(u.id));
  const alreadyInUsers = filteredUsers.filter(u =>  assignedUserIds.has(u.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh", animation: "fadeUp 0.2s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${dept.accentHex}22`, color: dept.accentHex }}
            >
              <SettingsIcon />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Manage Department</h2>
              <p className="text-white/40 text-xs mt-0.5 truncate max-w-[300px]">{dept.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-2 shrink-0">
          {(["menus", "users"] as const).map(tab => {
            const count   = tab === "menus" ? assignedMenuIds.size : assignedUserIds.size;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize"
                style={{
                  background: isActive ? `${dept.accentHex}22` : "rgba(255,255,255,0.05)",
                  color:      isActive ? dept.accentHex : "rgba(255,255,255,0.4)",
                  border:     isActive ? `1px solid ${dept.accentHex}44` : "1px solid transparent",
                }}
              >
                {tab === "menus" ? <MenusIcon /> : <UsersIcon />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: isActive ? `${dept.accentHex}33` : "rgba(255,255,255,0.08)",
                    color:      isActive ? dept.accentHex : "rgba(255,255,255,0.3)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-6 py-3 shrink-0">
          <div className="gv-input flex items-center gap-3 py-2.5 px-4">
            <SearchIcon />
            <input
              value={activeTab === "menus" ? menuSearch : userSearch}
              onChange={e =>
                activeTab === "menus"
                  ? setMenuSearch(e.target.value)
                  : setUserSearch(e.target.value)
              }
              placeholder={activeTab === "menus" ? "Search menus…" : "Search users…"}
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
            />
            {(activeTab === "menus" ? menuSearch : userSearch) && (
              <button
                type="button"
                onClick={() =>
                  activeTab === "menus" ? setMenuSearch("") : setUserSearch("")
                }
                className="text-white/30 hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* ── MENUS TAB ── */}
        {activeTab === "menus" && (
          <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
            {menusLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Available menus */}
                {availableMenus.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Available ({availableMenus.length})
                      </p>
                      <div className="flex items-center gap-3">
                        {selectedMenuIds.size > 0 && (
                          <span className="text-xs font-semibold" style={{ color: dept.accentHex }}>
                            {selectedMenuIds.size} selected
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMenuIds(new Set(availableMenus.map(m => m.id)))
                          }
                          className="text-xs font-semibold transition-colors"
                          style={{ color: dept.accentHex }}
                        >
                          Select all
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {availableMenus.map(menu => {
                        const isSelected = selectedMenuIds.has(menu.id);
                        return (
                          <div
                            key={menu.id}
                            onClick={() => toggleMenuSelect(menu.id)}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all select-none"
                            style={{
                              background: isSelected ? `${dept.accentHex}18` : "rgba(255,255,255,0.04)",
                              border:     isSelected ? `1px solid ${dept.accentHex}50` : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                              style={{
                                background: isSelected ? dept.accentHex : "rgba(255,255,255,0.08)",
                                border:     isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                              }}
                            >
                              {isSelected && <CheckIcon />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-sm font-semibold truncate">
                                {menu.title || menu.name}
                              </p>
                              {menu.link && (
                                <p className="text-white/35 text-xs truncate mt-0.5">{menu.link}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Assigned menus */}
                {assignedMenus.length > 0 && (
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                      Assigned ({assignedMenus.length})
                    </p>
                    <div className="space-y-2">
                      {assignedMenus.map(menu => {
                        const isRemoving = removingMenuIds.has(menu.id);
                        return (
                          <div
                            key={menu.id}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                            style={{
                              background: `${dept.accentHex}0e`,
                              border:     `1px solid ${dept.accentHex}28`,
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: `${dept.accentHex}33`, color: dept.accentHex }}
                            >
                              <CheckIcon />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-sm font-semibold truncate">
                                {menu.title || menu.name}
                              </p>
                              {menu.link && (
                                <p className="text-white/35 text-xs truncate mt-0.5">{menu.link}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMenu(menu)}
                              disabled={isRemoving}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                border:     "1px solid rgba(239,68,68,0.25)",
                                color:      "#f87171",
                              }}
                            >
                              {isRemoving ? <SpinnerIcon size={12} /> : <MinusIcon />}
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredMenus.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-10">No menus found</p>
                )}

                {!menusLoading && allMenus.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-10">
                    No menus available in the system
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
            {usersLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {availableUsers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Available ({availableUsers.length})
                      </p>
                      <div className="flex items-center gap-3">
                        {selectedUserIds.size > 0 && (
                          <span className="text-xs font-semibold" style={{ color: dept.accentHex }}>
                            {selectedUserIds.size} selected
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUserIds(new Set(availableUsers.map(u => u.id)))
                          }
                          className="text-xs font-semibold"
                          style={{ color: dept.accentHex }}
                        >
                          Select all
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {availableUsers.map(user => {
                        const isSelected = selectedUserIds.has(user.id);
                        const inits = user.name
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                        return (
                          <div
                            key={user.id}
                            onClick={() =>
                              setSelectedUserIds(prev => {
                                const s = new Set(prev);
                                s.has(user.id) ? s.delete(user.id) : s.add(user.id);
                                return s;
                              })
                            }
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all select-none"
                            style={{
                              background: isSelected ? `${dept.accentHex}18` : "rgba(255,255,255,0.04)",
                              border:     isSelected ? `1px solid ${dept.accentHex}50` : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                              style={{
                                background: isSelected ? dept.accentHex : "rgba(255,255,255,0.08)",
                                border:     isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                              }}
                            >
                              {isSelected && <CheckIcon />}
                            </div>
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                background: isSelected ? `${dept.accentHex}30` : "rgba(255,255,255,0.08)",
                                color:      isSelected ? dept.accentHex : "rgba(255,255,255,0.5)",
                              }}
                            >
                              {inits}
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

                {alreadyInUsers.length > 0 && (
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                      Already in Department ({alreadyInUsers.length})
                    </p>
                    <div className="space-y-2">
                      {alreadyInUsers.map(user => {
                        const inits = user.name
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                        return (
                          <div
                            key={user.id}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                            style={{
                              background: `${dept.accentHex}0e`,
                              border:     `1px solid ${dept.accentHex}28`,
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: `${dept.accentHex}33`, color: dept.accentHex }}
                            >
                              <CheckIcon />
                            </div>
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: `${dept.accentHex}22`, color: dept.accentHex }}
                            >
                              {inits}
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

                {filteredUsers.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-10">No users found</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="gv-btn-outline px-5 py-2.5 text-sm">
            Close
          </button>
          {activeTab === "menus" && selectedMenuIds.size > 0 && (
            <button
              type="button"
              onClick={assignSelectedMenus}
              disabled={menusSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: dept.accentHex, color: "#fff" }}
            >
              {menusSaving ? <SpinnerIcon /> : <PlusIcon />}
              {menusSaving
                ? "Assigning…"
                : `Assign ${selectedMenuIds.size} Menu${selectedMenuIds.size > 1 ? "s" : ""}`}
            </button>
          )}
          {activeTab === "users" && selectedUserIds.size > 0 && (
            <button
              type="button"
              onClick={assignSelectedUsers}
              disabled={usersSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: dept.accentHex, color: "#fff" }}
            >
              {usersSaving ? <SpinnerIcon /> : <PlusIcon />}
              {usersSaving
                ? "Assigning…"
                : `Assign ${selectedUserIds.size} User${selectedUserIds.size > 1 ? "s" : ""}`}
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

// ─── Create Department Modal ──────────────────────────────────────────────────
function CreateDeptModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName]                 = useState("");
  const [description, setDescription]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Department name is required."); return; }
    try {
      setIsSubmitting(true);
      setError(null);
      await api.post("/departments/create", {
        name: name.trim(),
        description: description.trim(),
      });
      onCreated();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Failed to create department.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-t-2xl flex flex-col"
        style={{ animation: "slideUp 0.22s ease" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-base">New Department</h2>
            <p className="text-white/40 text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors p-1"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Finance, Operations…"
              className="w-full gv-input px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional — what does this department do?"
              rows={3}
              className="w-full gv-input px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none resize-none"
            />
          </div>
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="gv-btn-outline flex-1 justify-center text-sm py-2.5"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: "#3B5BDB", color: "#fff" }}
          >
            {isSubmitting ? <SpinnerIcon /> : <PlusIcon />}
            {isSubmitting ? "Creating…" : "Create Department"}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Delete Request Modal ─────────────────────────────────────────────────────
function DeleteDeptModal({
  dept,
  onClose,
  onRequested,
}: {
  dept: Department;
  onClose: () => void;
  onRequested: () => void;
}) {
  const [reason, setReason]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Please provide a reason for deletion."); return; }
    try {
      setIsSubmitting(true);
      setError(null);
      await api.post(`/departments/${dept.id}/deletion-requests`, { reason: reason.trim() });
      onRequested();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Failed to submit deletion request.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 bg-[#0d1528] border border-white/10 rounded-2xl overflow-hidden"
        style={{ animation: "fadeUp 0.2s ease" }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(239,68,68,0.12)",
                border:     "1px solid rgba(239,68,68,0.25)",
                color:      "#f87171",
              }}
            >
              <TrashIcon />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Request Deletion</h2>
              <p className="text-white/40 text-xs mt-0.5 truncate max-w-[260px]">{dept.name}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div
            className="px-4 py-3 rounded-xl border"
            style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(251,191,36,0.8)" }}>
              This submits a deletion request for review. A director must approve before the
              department is permanently removed.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why should this department be deleted?"
              rows={3}
              className="w-full gv-input px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none resize-none"
            />
          </div>
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="gv-btn-outline flex-1 justify-center text-sm py-2.5"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: "rgba(239,68,68,0.15)",
              border:     "1px solid rgba(239,68,68,0.35)",
              color:      "#f87171",
            }}
          >
            {isSubmitting ? <SpinnerIcon /> : <TrashIcon />}
            {isSubmitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:scale(0.96) translateY(8px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}

// ─── Department Card ──────────────────────────────────────────────────────────
function DepartmentCard({
  dept,
  onViewUsers,
  onDelete,
  onManage,
}: {
  dept: Department;
  onViewUsers: () => void;
  onDelete: () => void;
  onManage: () => void;
}) {
  const { accentHex, menus, menusLoading } = dept;
  return (
    <div
      className="gv-card p-0 overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${accentHex}` }}
    >
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
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all mt-0.5"
            style={{
              background: "rgba(239,68,68,0.08)",
              border:     "1px solid rgba(239,68,68,0.18)",
              color:      "#f87171",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
            }}
            title="Request deletion"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/8" />

      <div className="px-4 py-3 flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <span style={{ color: accentHex }}><MenusIcon /></span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Menus</span>
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
            {[1,2].map(i => (
              <div key={i} className="h-6 rounded-md bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <p className="text-white/25 text-xs italic">No menus assigned</p>
        ) : (
          <ul className="space-y-1.5">
            {menus.map(m => (
              <li key={m.id} className="flex items-center gap-2 text-xs text-white/65">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentHex }} />
                <span className="truncate">{m.title || m.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <button
          type="button"
          onClick={onManage}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border:     "1px solid rgba(255,255,255,0.12)",
            color:      "rgba(255,255,255,0.6)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
          }}
        >
          <SettingsIcon /><span>Manage</span>
        </button>
        <button
          type="button"
          onClick={onViewUsers}
          className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: `${accentHex}14`,
            border:     `1px solid ${accentHex}35`,
            color:      accentHex,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentHex}28`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentHex}14`;
          }}
        >
          <div className="flex items-center gap-2"><UsersIcon /><span>Users</span></div>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="gv-card p-0 overflow-hidden animate-pulse"
      style={{ borderTop: "3px solid rgba(255,255,255,0.08)" }}
    >
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

  const [departments, setDepartments]   = useState<Department[]>(deptCache ?? []);
  const [isLoading, setIsLoading]       = useState(
    !deptCache || Date.now() - cacheTs > CACHE_TTL,
  );
  const [search, setSearch]             = useState("");
  const [showCreate, setShowCreate]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [manageTarget, setManageTarget] = useState<Department | null>(null);
  const [toast, setToast]               = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Progressive loader ───────────────────────────────────────────────────
  // Phase 1 — render dept shells immediately (menus shimmer)
  // Phase 2 — fire all dept menu requests in parallel
  // Phase 3 — patch each card as its menus resolve
  const fetchDepartments = useCallback(
    async (force = false) => {
      if (!force && deptCache && Date.now() - cacheTs < CACHE_TTL) {
        setDepartments(deptCache);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await api.get("/departments/list");
        const raw      = parseList(data);

        // Phase 1 — show cards straight away with menu placeholders
        const shell: Department[] = raw.map((d: any, idx: number) => ({
          id:           d.id,
          name:         d.name,
          description:  d.description ?? "",
          accentHex:    accentFor(idx),
          menus:        [],
          menusLoading: true,
        }));
        setDepartments(shell);
        setIsLoading(false);

        // Phase 2+3 — one menu request per dept, all fired simultaneously
        shell.forEach(dept => {
          api
            .get(`/departments/${dept.id}/menus`)
            .then(res => {
              const menus = parseMenuList(res.data);

              setDepartments(prev => {
                const updated = prev.map(d =>
                  d.id === dept.id ? { ...d, menus, menusLoading: false } : d,
                );
                // Persist to cache only once every dept has finished loading
                if (updated.every(d => !d.menusLoading)) {
                  deptCache = updated;
                  cacheTs   = Date.now();
                }
                return updated;
              });
            })
            .catch(() => {
              // On error mark that dept done with empty menus so spinner stops
              setDepartments(prev =>
                prev.map(d =>
                  d.id === dept.id ? { ...d, menusLoading: false } : d,
                ),
              );
            });
        });
      } catch {
        showToast("Failed to load departments", "error");
        setIsLoading(false);
      }
    },
    [showToast],
  );

  // Keep the manageTarget card in sync when menus change
  const handleMenusChanged = useCallback((deptId: number, menus: Menu[]) => {
    setDepartments(prev => {
      const updated = prev.map(d => (d.id === deptId ? { ...d, menus } : d));
      // Update cache in place if it already exists
      if (deptCache) {
        deptCache = updated;
      }
      return updated;
    });
    setManageTarget(prev => (prev?.id === deptId ? { ...prev, menus } : prev));
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const filtered = useMemo(
    () =>
      departments.filter(
        d =>
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDepartments(true)}
            className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center"
          >
            <RefreshIcon /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#3B5BDB", color: "#fff" }}
          >
            <PlusIcon /> Add Department
          </button>
        </div>
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
        All Departments {!isLoading && `(${filtered.length})`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
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
                background: "#3B5BDB22",
                border:     "1px solid #3B5BDB44",
                color:      "#3B5BDB",
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
              onViewUsers={() => router.push(`/sections/departments/${dept.id}`)}
              onDelete={() => setDeleteTarget(dept)}
              onManage={() => setManageTarget(dept)}
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
            fetchDepartments(true);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDeptModal
          dept={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onRequested={() =>
            showToast("Deletion request submitted for review.", "success")
          }
        />
      )}

      {manageTarget && (
        <ManageModal
          dept={manageTarget}
          onClose={() => setManageTarget(null)}
          onMenusChanged={handleMenusChanged}
          showToast={showToast}
        />
      )}
    </div>
  );
}