"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string;
  order: number;
}

interface MenuItem {
  id: number;
  name: string;
  title: string;
  link?: string;
  submenus: SubMenu[];
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/40">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Dialog ──────────────────────────────────────────────────────────────────
function Dialog({ title, onClose, children, actions }: {
  title: string; onClose: () => void; children: React.ReactNode; actions: React.ReactNode;
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

// ─── Sub-menu Detail Sheet ────────────────────────────────────────────────────
function SubMenuDetailSheet({ menu, sub, onClose }: { menu: MenuItem; sub: SubMenu; onClose: () => void }) {
  const rows = [
    { icon: "🏷️", label: "Name", value: sub.name },
    { icon: "📌", label: "Title", value: sub.title },
    { icon: "🔗", label: "Link", value: sub.link || "—" },
    { icon: "📁", label: "Parent Menu", value: menu.title },
    { icon: "🔢", label: "Order", value: String(sub.order) },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-t-2xl pb-8" style={{ animation: "slideUp 0.22s ease" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <div className="gv-icon-box"><GridIcon /></div>
          <div>
            <p className="text-white font-bold">{sub.title}</p>
            <p className="text-white/40 text-xs">Part of: {menu.title}</p>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-sm">{r.icon}</span>
                <span className="text-white/50 text-xs font-medium">{r.label}</span>
              </div>
              <span className="text-white text-xs font-semibold max-w-[180px] truncate text-right">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="px-4">
          <button onClick={onClose} className="gv-btn-outline w-full justify-center text-sm py-2.5">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Chevron Icon ─────────────────────────────────────────────────────────────
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({ menu, onEdit, onDelete, onAddSubMenu, onDeleteSubMenu, onSubMenuTap }: {
  menu: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubMenu: () => void;
  onDeleteSubMenu: (sub: SubMenu) => void;
  onSubMenuTap: (sub: SubMenu) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...(menu.submenus ?? [])].sort((a, b) => a.order - b.order);
  const displayLimit = 3;
  const shown = expanded ? sorted : sorted.slice(0, displayLimit);
  const extra = sorted.length - displayLimit;
  const hasMore = extra > 0;

  return (
    <div className="gv-card p-0 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="gv-icon-box"><GridIcon /></div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{menu.title}</p>
            {menu.link && <p className="text-white/30 text-xs mt-0.5">{menu.link}</p>}
            <p className="text-white/25 text-xs mt-0.5">{sorted.length} sub-menu{sorted.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} title="Edit"
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <EditIcon />
          </button>
          <button onClick={onDelete} title="Delete"
            className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Sub-menus */}
      <div className="flex-1 p-3 space-y-1.5">
        {shown.length === 0 && (
          <p className="text-white/30 text-xs text-center py-2">No sub-menus yet</p>
        )}
        {shown.map(sub => (
          <div key={sub.id}
            onClick={() => onSubMenuTap(sub)}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <LinkIcon />
              <span className="text-white/70 text-xs font-medium truncate">{sub.title}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDeleteSubMenu(sub); }}
              className="text-red-400/60 hover:text-red-400 transition-colors p-0.5 flex-shrink-0"
            >
              <TrashIcon />
            </button>
          </div>
        ))}

        {/* Show more / Show less toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronIcon open={expanded} />
            {expanded ? "Show less" : `Show ${extra} more sub-menu${extra > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Add sub-menu */}
      <div className="p-3 pt-0">
        <button onClick={onAddSubMenu}
          className="w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 text-white/50 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        >
          <PlusIcon /> Add Sub-menu
        </button>
      </div>
    </div>
  );
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addSubMenuTarget, setAddSubMenuTarget] = useState<MenuItem | null>(null);
  const [editMenuTarget, setEditMenuTarget] = useState<MenuItem | null>(null);
  const [deleteMenuTarget, setDeleteMenuTarget] = useState<MenuItem | null>(null);
  const [deleteSubMenuTarget, setDeleteSubMenuTarget] = useState<{ menu: MenuItem; sub: SubMenu } | null>(null);
  const [subMenuDetail, setSubMenuDetail] = useState<{ menu: MenuItem; sub: SubMenu } | null>(null);

  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [editFormTitle, setEditFormTitle] = useState("");
  const [editFormLink, setEditFormLink] = useState("");

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/menus/list");
      const menuData: MenuItem[] = data?.data ?? data;
      if (!Array.isArray(menuData)) { setMenus([]); return; }
      const seen = new Set<string>();
      const unique = menuData.filter((m: MenuItem) => {
        if (seen.has(m.name)) return false;
        seen.add(m.name);
        return true;
      });
      setMenus(unique);
    } catch (err) {
      showToast("Failed to load menus", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => { setFormName(""); setFormTitle(""); setFormLink(""); };

  const filteredMenus = useMemo(() =>
    menus.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.submenus ?? []).some(s => s.title.toLowerCase().includes(search.toLowerCase()))
    ), [menus, search]);

  const handleAddMenu = async () => {
    if (!formTitle.trim()) return;
    try {
      setIsSaving(true);
      await api.post("/menus/create", {
        name: formName || formTitle.toLowerCase().replaceAll(" ", "_"),
        title: formTitle,
        link: formLink || null,
      });
      showToast("Menu added successfully", "success");
      setAddMenuOpen(false);
      resetForm();
      fetchMenus();
    } catch { showToast("Failed to add menu", "error"); }
    finally { setIsSaving(false); }
  };

  const handleAddSubMenu = async () => {
    if (!formTitle.trim() || !addSubMenuTarget) return;
    try {
      setIsSaving(true);
      await api.post("/menus/submenu/create", {
        menuId: addSubMenuTarget.id,
        name: formName || formTitle.toLowerCase().replaceAll(" ", "_"),
        title: formTitle,
        link: formLink || null,
        order: (addSubMenuTarget.submenus?.length ?? 0) + 1,
      });
      showToast("Sub-menu added successfully", "success");
      setAddSubMenuTarget(null);
      resetForm();
      fetchMenus();
    } catch { showToast("Failed to add sub-menu", "error"); }
    finally { setIsSaving(false); }
  };

  const handleEditMenu = async () => {
    if (!editMenuTarget || !editFormTitle.trim()) return;
    try {
      setIsSaving(true);
      await api.put(`/menus/${editMenuTarget.id}`, { title: editFormTitle, link: editFormLink || null });
      showToast("Menu updated", "success");
      setEditMenuTarget(null);
      fetchMenus();
    } catch { showToast("Failed to update menu", "error"); }
    finally { setIsSaving(false); }
  };

  const handleDeleteMenu = async () => {
    if (!deleteMenuTarget) return;
    try {
      setIsSaving(true);
      await api.delete(`/menus/${deleteMenuTarget.id}`);
      showToast("Menu deleted", "success");
      setDeleteMenuTarget(null);
      fetchMenus();
    } catch { showToast("Failed to delete menu", "error"); }
    finally { setIsSaving(false); }
  };

  const handleDeleteSubMenu = async () => {
    if (!deleteSubMenuTarget) return;
    try {
      setIsSaving(true);
      await api.delete(`/menus/submenu/${deleteSubMenuTarget.sub.id}`);
      showToast("Sub-menu deleted", "success");
      setDeleteSubMenuTarget(null);
      fetchMenus();
    } catch { showToast("Failed to delete sub-menu", "error"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="gv-eyebrow mb-1">Department</p>
          <h1 className="text-white text-2xl font-bold">Menus</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMenus} className="gv-btn-outline px-3 py-2 text-sm gap-2 flex items-center">
            <RefreshIcon /> Refresh
          </button>
          <button onClick={() => { resetForm(); setAddMenuOpen(true); }} className="gv-btn-brand px-4 py-2 text-sm gap-2">
            <PlusIcon /> Add Menu
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search menus or sub-menus..."
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Count label */}
      <p className="gv-eyebrow">
        All Menus {!isLoading && `(${filteredMenus.length})`}
      </p>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="gv-card h-48 animate-pulse p-0 overflow-hidden">
              <div className="h-14 bg-white/5" />
              <div className="p-3 space-y-2">
                {[1, 2, 3].map(j => <div key={j} className="h-8 bg-white/5 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-white/40 text-sm">
            {search ? "No menus match your search." : "No menus yet. Click 'Add Menu' to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredMenus.map(menu => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={() => { setEditFormTitle(menu.title); setEditFormLink(menu.link ?? ""); setEditMenuTarget(menu); }}
              onDelete={() => setDeleteMenuTarget(menu)}
              onAddSubMenu={() => { resetForm(); setAddSubMenuTarget(menu); }}
              onDeleteSubMenu={sub => setDeleteSubMenuTarget({ menu, sub })}
              onSubMenuTap={sub => setSubMenuDetail({ menu, sub })}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Add Menu ── */}
      {addMenuOpen && (
        <Dialog title="Add Menu" onClose={() => setAddMenuOpen(false)} actions={
          <>
            <button onClick={() => setAddMenuOpen(false)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleAddMenu} disabled={isSaving} className="gv-btn-brand px-4 py-2 text-sm">
              {isSaving ? "Saving…" : "Add"}
            </button>
          </>
        }>
          <FormField label="Name (optional)" value={formName} onChange={setFormName} placeholder="e.g. site_management" />
          <FormField label="Title *" value={formTitle} onChange={setFormTitle} placeholder="e.g. Site Management" />
          <FormField label="Link" value={formLink} onChange={setFormLink} placeholder="e.g. /site-management" />
        </Dialog>
      )}

      {/* ── Add Sub-menu ── */}
      {addSubMenuTarget && (
        <Dialog title={`Add Sub-menu → '${addSubMenuTarget.title}'`} onClose={() => setAddSubMenuTarget(null)} actions={
          <>
            <button onClick={() => setAddSubMenuTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleAddSubMenu} disabled={isSaving} className="gv-btn-brand px-4 py-2 text-sm">
              {isSaving ? "Saving…" : "Add"}
            </button>
          </>
        }>
          <FormField label="Name (optional)" value={formName} onChange={setFormName} placeholder="e.g. site_list" />
          <FormField label="Title *" value={formTitle} onChange={setFormTitle} placeholder="e.g. Site List" />
          <FormField label="Link" value={formLink} onChange={setFormLink} placeholder="e.g. /site-management/list" />
        </Dialog>
      )}

      {/* ── Edit Menu ── */}
      {editMenuTarget && (
        <Dialog title={`Edit '${editMenuTarget.title}'`} onClose={() => setEditMenuTarget(null)} actions={
          <>
            <button onClick={() => setEditMenuTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleEditMenu} disabled={isSaving} className="gv-btn-brand px-4 py-2 text-sm">
              {isSaving ? "Saving…" : "Save"}
            </button>
          </>
        }>
          <FormField label="Title *" value={editFormTitle} onChange={setEditFormTitle} placeholder="e.g. Site Management" />
          <FormField label="Link" value={editFormLink} onChange={setEditFormLink} placeholder="e.g. /site-management" />
        </Dialog>
      )}

      {/* ── Delete Menu ── */}
      {deleteMenuTarget && (
        <Dialog title="Delete Menu" onClose={() => setDeleteMenuTarget(null)} actions={
          <>
            <button onClick={() => setDeleteMenuTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleDeleteMenu} disabled={isSaving} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
              {isSaving ? "Deleting…" : "Delete"}
            </button>
          </>
        }>
          <p className="text-white/70 text-sm">Remove <strong className="text-white">'{deleteMenuTarget.title}'</strong> and all its sub-menus? This cannot be undone.</p>
        </Dialog>
      )}

      {/* ── Delete Sub-menu ── */}
      {deleteSubMenuTarget && (
        <Dialog title="Delete Sub-menu" onClose={() => setDeleteSubMenuTarget(null)} actions={
          <>
            <button onClick={() => setDeleteSubMenuTarget(null)} className="gv-btn-outline px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleDeleteSubMenu} disabled={isSaving} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
              {isSaving ? "Deleting…" : "Delete"}
            </button>
          </>
        }>
          <p className="text-white/70 text-sm">Delete <strong className="text-white">'{deleteSubMenuTarget.sub.title}'</strong> from <strong className="text-white">'{deleteSubMenuTarget.menu.title}'</strong>?</p>
        </Dialog>
      )}

      {/* ── Sub-menu Detail ── */}
      {subMenuDetail && (
        <SubMenuDetailSheet
          menu={subMenuDetail.menu}
          sub={subMenuDetail.sub}
          onClose={() => setSubMenuDetail(null)}
        />
      )}
    </div>
  );
}