'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useMenuStore } from '@/store/menu-store';
import {
  ChevronDown, ChevronRight, Plus, Pencil,
  Trash2, X, Check, Layers, List, AlignLeft,
} from 'lucide-react';
import { API } from '@/lib/endpoints';

interface SubSubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
}

interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
  subsubmenus?: SubSubMenu[];
}

interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
  submenus?: SubMenu[];
}

type ModalType =
  | { type: 'menu-create' }
  | { type: 'menu-edit'; menu: Menu }
  | { type: 'submenu-create'; menuId: number }
  | { type: 'submenu-edit'; submenu: SubMenu; menuId: number }
  | { type: 'subsubmenu-create'; submenuId: number }
  | { type: 'subsubmenu-edit'; subsubmenu: SubSubMenu; submenuId: number }
  | null;

const inputClass =
  'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30';
const labelClass = 'block text-xs font-medium text-blue-100/70 mb-1 uppercase tracking-wide';

export default function MenusPage() {
  const { menus: cachedMenus, isLoaded, setMenus, clearMenus } = useMenuStore();

  const [menus, setLocalMenus] = useState<Menu[]>(cachedMenus as Menu[]);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState({ name: '', title: '', link: '', order: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(API.menus.list);
      const payload = data?.data ?? data;
      const list = Array.isArray(payload) ? payload : [];
      setMenus(list); 
      setLocalMenus(list);   
    } catch {
      setLocalMenus([]);
    } finally {
      setIsLoading(false);
    }
  }, [setMenus]);

  useEffect(() => {
    if (!isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMenus();
    }
  }, [isLoaded, fetchMenus]);

  useEffect(() => {
    if (isLoaded && cachedMenus.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalMenus(cachedMenus as Menu[]);
    }
  }, [isLoaded, cachedMenus]);

  const openModal = (m: ModalType, prefill?: Partial<typeof form>) => {
    setError('');
    setForm({ name: '', title: '', link: '', order: '0', ...prefill });
    setModal(m);
  };

  const closeModal = () => { setModal(null); setError(''); };

  const invalidateAndRefresh = async () => {
    clearMenus();
    await fetchMenus();
  };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const body = {
        name:  form.name,
        title: form.title,
        link:  form.link || null,
        order: Number(form.order),
      };

      if (modal.type === 'menu-create')
        await api.post(API.menus.create, body);
      else if (modal.type === 'menu-edit')
        await api.patch(`menus/${modal.menu.id}`, body);
      else if (modal.type === 'submenu-create')
        await api.post(API.menus.submenus, { ...body, menu_id: modal.menuId });
      else if (modal.type === 'submenu-edit')
        await api.patch(`/menus/submenus/${modal.submenu.id}`, body);
      else if (modal.type === 'subsubmenu-create')
        await api.post(API.menus.subsubmenus, { ...body, submenu_id: modal.submenuId });
      else if (modal.type === 'subsubmenu-edit')
        await api.patch(`/menus/subsubmenus/${modal.subsubmenu.id}`, body);

      closeModal();
      await invalidateAndRefresh(); 
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      setError(e.response?.data?.detail || e.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: 'menu' | 'submenu' | 'subsubmenu', id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'menu') await api.delete(API.menus.delete(id));
      else if (type === 'submenu') await api.delete(API.menus.deleteSubmenu(id));
      else await api.delete(API.menus.deleteSubsubmenu(id));
      await invalidateAndRefresh();
    } catch {
      alert('Failed to delete');
    }
  };

  const toggle = (set: Set<number>, id: number): Set<number> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  };

  const modalTitle: Record<string, string> = {
    'menu-create':        'New Menu',
    'menu-edit':          'Edit Menu',
    'submenu-create':     'New Submenu',
    'submenu-edit':       'Edit Submenu',
    'subsubmenu-create':  'New Sub-submenu',
    'subsubmenu-edit':    'Edit Sub-submenu',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Menus</h2>
          <p className="text-sm text-blue-200/60">{menus.length} top-level menus</p>
        </div>
        <button
          onClick={() => openModal({ type: 'menu-create' })}
          className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
        >
          <Plus size={16} /> New Menu
        </button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Layers size={48} className="mb-3 opacity-40" />
            <p className="text-sm">No menus yet. Create your first one.</p>
          </div>
        ) : (
          menus
            .sort((a, b) => a.order - b.order)
            .map((menu) => (
              <div key={menu.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setOpenMenus(toggle(openMenus, menu.id))} className="text-white/40 hover:text-white transition-colors">
                    {openMenus.has(menu.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="w-8 h-8 bg-[#33907C]/20 border border-[#33907C]/30 rounded-lg flex items-center justify-center shrink-0">
                    <List size={14} className="text-[#33907C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{menu.title}</p>
                    <p className="text-xs text-white/40">{menu.name} · order {menu.order}{menu.link ? ` · ${menu.link}` : ''}</p>
                  </div>
                  <span className="text-xs text-white/30 mr-2">
                    {menu.submenus?.length ?? 0} submenu{(menu.submenus?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <button onClick={() => openModal({ type: 'submenu-create', menuId: menu.id })} className="p-1.5 text-white/40 hover:text-[#33907C] hover:bg-[#33907C]/10 rounded-lg transition-colors" title="Add submenu">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => openModal({ type: 'menu-edit', menu }, { name: menu.name, title: menu.title, link: menu.link ?? '', order: String(menu.order) })} className="p-1.5 text-white/40 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete('menu', menu.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {openMenus.has(menu.id) && (
                  <div className="border-t border-white/10">
                    {!menu.submenus?.length ? (
                      <p className="px-12 py-3 text-xs text-white/30 italic">No submenus</p>
                    ) : (
                      menu.submenus.sort((a, b) => a.order - b.order).map((sub) => (
                        <div key={sub.id} className="border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3 pl-10 pr-4 py-2.5 bg-white/2">
                            <button onClick={() => setOpenSubs(toggle(openSubs, sub.id))} className="text-white/30 hover:text-white transition-colors">
                              {openSubs.has(sub.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-md flex items-center justify-center shrink-0">
                              <AlignLeft size={11} className="text-white/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80">{sub.title}</p>
                              <p className="text-xs text-white/30">{sub.name} · order {sub.order}{sub.link ? ` · ${sub.link}` : ''}</p>
                            </div>
                            <span className="text-xs text-white/20 mr-2">{sub.subsubmenus?.length ?? 0} sub-sub</span>
                            <button onClick={() => openModal({ type: 'subsubmenu-create', submenuId: sub.id })} className="p-1.5 text-white/30 hover:text-[#33907C] hover:bg-[#33907C]/10 rounded-lg transition-colors">
                              <Plus size={13} />
                            </button>
                            <button onClick={() => openModal({ type: 'submenu-edit', submenu: sub, menuId: menu.id }, { name: sub.name, title: sub.title, link: sub.link ?? '', order: String(sub.order) })} className="p-1.5 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete('submenu', sub.id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {openSubs.has(sub.id) && (
                            <div className="border-t border-white/5">
                              {!sub.subsubmenus?.length ? (
                                <p className="px-20 py-2.5 text-xs text-white/20 italic">No sub-submenus</p>
                              ) : (
                                sub.subsubmenus.sort((a, b) => a.order - b.order).map((ssub) => (
                                  <div key={ssub.id} className="flex items-center gap-3 pl-20 pr-4 py-2 bg-white/1.5 border-b border-white/5 last:border-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-white/60">{ssub.title}</p>
                                      <p className="text-xs text-white/25">{ssub.name} · order {ssub.order}{ssub.link ? ` · ${ssub.link}` : ''}</p>
                                    </div>
                                    <button onClick={() => openModal({ type: 'subsubmenu-edit', subsubmenu: ssub, submenuId: sub.id }, { name: ssub.name, title: ssub.title, link: ssub.link ?? '', order: String(ssub.order) })} className="p-1.5 text-white/20 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                                      <Pencil size={12} />
                                    </button>
                                    <button onClick={() => handleDelete('subsubmenu', ssub.id)} className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d1528] border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">{modalTitle[modal.type]}</h3>
              <button onClick={closeModal} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name <span className="text-white/30 normal-case">(slug, no spaces)</span></label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. manage_users" />
              </div>
              <div>
                <label className={labelClass}>Title <span className="text-white/30 normal-case">(display label)</span></label>
                <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Manage Users" />
              </div>
              <div>
                <label className={labelClass}>Link <span className="text-white/30 normal-case">(route path, optional)</span></label>
                <input className={inputClass} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="e.g. /users/dashboard" />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.title}
                className="flex-1 flex items-center justify-center gap-2 bg-[#33907C] text-white px-4 py-2.5 rounded-lg hover:bg-[#2a7a69] transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}