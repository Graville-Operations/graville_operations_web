'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Title, Label, Body } from '@/components/ui/typography';
import { useDepartmentDetail } from '@/hooks/department/use-department-detail';
import { useAssignMenus } from '@/hooks/department/use-assign-menus';
import { useAssignUsers } from '@/hooks/department/use-assign-users';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Menu, User } from '@/types/department-detail';
import { ROUTES } from '@/lib/routes';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white
      z-60 shadow-xl pointer-events-none
      ${type === 'success' ? 'bg-[#33907c]' : 'bg-red-600'}`}
    >
      <Label size="sm" as="span" className="text-white normal-case tracking-normal">
        {message}
      </Label>
    </div>
  );
}

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SpinnerIcon = ({ size = 14 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const MenusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function ListRowSkeleton({ avatar = false }: { avatar?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="gv-bone shrink-0"
        style={{ width: '1.75rem', height: '1.75rem', borderRadius: avatar ? '9999px' : '0.5rem' }}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone w="55%" h="0.8rem" />
        <Bone w="35%" h="0.7rem" />
      </div>
      <div className="gv-bone shrink-0" style={{ width: '4.5rem', height: '1.75rem', borderRadius: '0.5rem' }} />
    </div>
  );
}

function AssignRowSkeleton({ avatar = false }: { avatar?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="gv-bone shrink-0" style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem' }} />
      {avatar && (
        <div className="gv-bone shrink-0" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px' }} />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <Bone w="60%" h="0.8rem" />
        <Bone w="40%" h="0.7rem" />
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '80vh', animation: 'fadeUp 0.2s ease' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <Title size="sm" as="h2">{title}</Title>
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
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {icon}
      </div>
      <Body size="sm" subtle>{label}</Body>
      {action}
    </div>
  );
}

function SelectRow({ isSelected, onClick, children }: {
  isSelected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all select-none"
      style={{
        background: isSelected ? 'color-mix(in srgb, var(--gv-brand) 14%, transparent)' : 'rgba(255,255,255,0.04)',
        border: isSelected ? '1px solid color-mix(in srgb, var(--gv-brand) 45%, transparent)' : '1px solid rgba(255,255,255,0.08)',
      }}>
      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
        style={{ background: isSelected ? 'var(--gv-brand)' : 'rgba(255,255,255,0.08)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
        {isSelected && <CheckIcon />}
      </div>
      {children}
    </div>
  );
}

type RemoveTarget =
  | { type: 'menu'; menu: Menu }
  | { type: 'user'; user: User };

function ConfirmRemoveModal({ target, busy, onCancel, onConfirm }: {
  target: RemoveTarget;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const label = target.type === 'menu'
    ? (target.menu.title || target.menu.name)
    : target.user.name;
  const nounSingular = target.type === 'menu' ? 'menu' : 'user';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="w-full max-w-md bg-[#0d1528] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: 'fadeUp 0.2s ease' }}>
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <Title size="sm" as="h2">Remove {nounSingular}?</Title>
          <button type="button" onClick={onCancel} disabled={busy}
            className="text-white/30 hover:text-white transition-colors p-1 -mt-1 -mr-1 disabled:opacity-40">
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 pb-5">
          <Body size="sm" muted>
            You&apos;ll need to assign <span className="font-semibold text-white/80">{label}</span> again to restore access.
          </Body>
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy}
            className="gv-btn-outline px-4 py-1.5 text-sm disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
            {busy && <SpinnerIcon size={12} />}
            {busy ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function AssignMenuModal({ deptId, currentMenuIds, onClose, onAssigned, showToast }: {
  deptId: number; currentMenuIds: Set<number>;
  onClose: () => void; onAssigned: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const { available, alreadyAssignedCount, loading, errMsg, search, setSearch, selected, toggle, selectAll, deselectAll, saving, assign } =
    useAssignMenus(deptId, currentMenuIds);

  const handleAssign = async () => {
    const result = await assign();
    if (result.ok) {
      showToast(`${selected.size} menu${selected.size > 1 ? 's' : ''} assigned`, 'success');
      onAssigned();
      onClose();
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <Modal title="Assign Menus" onClose={onClose}>
      <div className="px-6 pt-3 pb-2 shrink-0">
        <div className="gv-input flex items-center gap-2 py-2 px-3">
          <SearchIcon />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menus…"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30" />
          {search && <button type="button" onClick={() => setSearch('')} className="text-white/30 hover:text-white"><CloseIcon /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {loading ? (
          [1, 2, 3, 4].map(i => <AssignRowSkeleton key={i} />)
        ) : errMsg ? (
          <div className="px-4 py-4 rounded-xl space-y-1.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Body size="sm" as="p" className="text-red-400 font-semibold">Could not load menus</Body>
            <Body size="xs" mono as="p" className="text-red-300/60 break-all">{errMsg}</Body>
          </div>
        ) : available.length === 0 ? (
          <Body size="sm" subtle as="p" className="text-center py-10">
            {alreadyAssignedCount > 0 && available.length === 0 ? 'All menus already assigned.' : 'No menus match.'}
          </Body>
        ) : (
          <>
            <div className="flex items-center justify-between py-1">
              <Body size="xs" subtle as="span">{available.length} available</Body>
              <button type="button"
                onClick={() => selected.size === available.length ? deselectAll() : selectAll()}
                className="text-xs font-semibold" style={{ color: 'var(--gv-brand)' }}>
                {selected.size === available.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {available.map(menu => (
              <SelectRow key={menu.id} isSelected={selected.has(menu.id)} onClick={() => toggle(menu.id)}>
                <div className="min-w-0 flex-1">
                  <Body size="sm" as="p" className="font-semibold truncate">{menu.title || menu.name}</Body>
                  {menu.link && <Body size="xs" subtle as="p" className="truncate mt-0.5">{menu.link}</Body>}
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
          style={{ background: 'var(--gv-brand)', color: '#fff' }}>
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? 'Assigning…' : selected.size > 0 ? `Assign ${selected.size} Menu${selected.size > 1 ? 's' : ''}` : 'Assign'}
        </button>
      </div>
    </Modal>
  );
}

function AssignUserModal({ deptId, currentUserEmails, onClose, onAssigned, showToast }: {
  deptId: number; currentUserEmails: Set<string>;
  onClose: () => void; onAssigned: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const { available, alreadyAssignedCount, loading, errMsg, search, setSearch, selected, toggle, selectAll, deselectAll, saving, assign } =
    useAssignUsers(deptId, currentUserEmails);

  const handleAssign = async () => {
    const result = await assign();
    if (result.ok) {
      showToast(`${selected.size} user${selected.size > 1 ? 's' : ''} assigned`, 'success');
      onAssigned();
      onClose();
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <Modal title="Assign Users" onClose={onClose}>
      <div className="px-6 pt-3 pb-2 shrink-0">
        <div className="gv-input flex items-center gap-2 py-2 px-3">
          <SearchIcon />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30" />
          {search && <button type="button" onClick={() => setSearch('')} className="text-white/30 hover:text-white"><CloseIcon /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {loading ? (
          [1, 2, 3, 4].map(i => <AssignRowSkeleton key={i} avatar />)
        ) : errMsg ? (
          <div className="px-4 py-4 rounded-xl space-y-1.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Body size="sm" as="p" className="text-red-400 font-semibold">Could not load users</Body>
            <Body size="xs" mono as="p" className="text-red-300/60 break-all">{errMsg}</Body>
            <Body size="xs" subtle as="p" className="mt-1">Share this message so the parser can be fixed.</Body>
          </div>
        ) : available.length === 0 ? (
          <Body size="sm" subtle as="p" className="text-center py-10">
            {alreadyAssignedCount > 0 && available.length === 0 ? 'All users already assigned.' : 'No users match.'}
          </Body>
        ) : (
          <>
            <div className="flex items-center justify-between py-1">
              <Body size="xs" subtle as="span">{available.length} available</Body>
              <button type="button"
                onClick={() => selected.size === available.length ? deselectAll() : selectAll()}
                className="text-xs font-semibold" style={{ color: 'var(--gv-brand)' }}>
                {selected.size === available.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {available.map(user => {
              const inits = user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <SelectRow key={user.id} isSelected={selected.has(user.id)} onClick={() => toggle(user.id)}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: selected.has(user.id) ? 'color-mix(in srgb, var(--gv-brand) 25%, transparent)' : 'rgba(255,255,255,0.08)',
                      color: selected.has(user.id) ? 'var(--gv-brand)' : 'rgba(255,255,255,0.5)',
                    }}>
                    {inits}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Body size="sm" as="p" className="font-semibold truncate">{user.name}</Body>
                    <Body size="xs" subtle as="p" className="truncate">{user.role || user.email}</Body>
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
          style={{ background: 'var(--gv-brand)', color: '#fff' }}>
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? 'Assigning…' : selected.size > 0 ? `Assign ${selected.size} User${selected.size > 1 ? 's' : ''}` : 'Assign'}
        </button>
      </div>
    </Modal>
  );
}

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deptId = Number(params?.id);

  const {
    dept, menus, users,
    deptLoading, menusLoading, usersLoading,
    removingMenuId, removingUserEmail,
    toast, showToast,
    load, loadMenus, loadUsers,
    removeMenu, removeUser,
    assignedMenuIds, assignedUserEmails,
  } = useDepartmentDetail(deptId);

  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

  const removeBusy = removeTarget
    ? (removeTarget.type === 'menu'
        ? removingMenuId === removeTarget.menu.id
        : removingUserEmail === removeTarget.user.email)
    : false;

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    if (removeTarget.type === 'menu') {
      await removeMenu(removeTarget.menu);
      showToast(`${removeTarget.menu.title || removeTarget.menu.name} removed`, 'success');
    } else {
      await removeUser(removeTarget.user);
      showToast(`${removeTarget.user.name} removed`, 'success');
    }
    setRemoveTarget(null);
  };

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.push(ROUTES.sections.departments.list)}
            className="gv-btn-outline w-9 h-9 flex items-center justify-center p-0 shrink-0">
            <BackIcon />
          </button>
          <div>
            <Label size="sm" as="p" className="gv-eyebrow mb-0.5">Departments</Label>
            {deptLoading ? (
              <Bone w="12rem" h="1.75rem" style={{ borderRadius: '0.5rem' }} />
            ) : dept ? (
              <Title size="md" as="h1">{dept.name}</Title>
            ) : (
              <Title size="md" as="h1">Department #{deptId}</Title>
            )}
            {dept?.description && (
              <Body size="sm" muted className="mt-1">{dept.description}</Body>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button type="button" onClick={load}
            className="gv-btn-outline w-9 h-9 flex items-center justify-center p-0" title="Refresh">
            <RefreshIcon />
          </button>
          <button type="button" onClick={() => setShowAssignMenu(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.7)' }}>
            <PlusIcon /> Assign Menu
          </button>
          <button type="button" onClick={() => setShowAssignUser(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--gv-brand)', color: '#fff' }}>
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
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MenusIcon />
            </div>
            <Body size="sm" as="span" className="font-semibold">Menus</Body>
            {!menusLoading && (
              <Body size="xs" subtle as="span"
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                {menus.length}
              </Body>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menusLoading ? (
              [1, 2, 3].map(i => <ListRowSkeleton key={i} />)
            ) : menus.length === 0 ? (
              <EmptyState icon={<MenusIcon />} label="No menus assigned yet"
                action={
                  <button type="button" onClick={() => setShowAssignMenu(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <PlusIcon /> Assign a menu
                  </button>
                } />
            ) : menus.map(menu => (
              <div key={menu.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white/30"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <MenusIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <Body size="sm" as="p" className="font-semibold truncate">{menu.title || menu.name}</Body>
                  {menu.link && (
                    <Body size="xs" subtle as="p" className="truncate mt-0.5 flex items-center gap-1">
                      <LinkIcon />{menu.link}
                    </Body>
                  )}
                </div>
                <button type="button" onClick={() => setRemoveTarget({ type: 'menu', menu })}
                  disabled={removingMenuId === menu.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
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
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <UsersIcon />
            </div>
            <Body size="sm" as="span" className="font-semibold">Users</Body>
            {!usersLoading && (
              <Body size="xs" subtle as="span"
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                {users.length}
              </Body>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {usersLoading ? (
              [1, 2, 3].map(i => <ListRowSkeleton key={i} avatar />)
            ) : users.length === 0 ? (
              <EmptyState icon={<UsersIcon />} label="No users assigned yet"
                action={
                  <button type="button" onClick={() => setShowAssignUser(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <PlusIcon /> Assign a user
                  </button>
                } />
            ) : users.map((user, idx) => {
              const inits = user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={user.email || idx}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                    {inits}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Body size="sm" as="p" className="font-semibold truncate">{user.name}</Body>
                    <Body size="xs" subtle as="p" className="truncate">{user.role || user.email}</Body>
                  </div>
                  <button type="button" onClick={() => setRemoveTarget({ type: 'user', user })}
                    disabled={removingUserEmail === user.email}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                    {removingUserEmail === user.email ? <SpinnerIcon size={11} /> : <MinusIcon />}
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
        <AssignMenuModal
          deptId={deptId}
          currentMenuIds={assignedMenuIds}
          onClose={() => setShowAssignMenu(false)}
          onAssigned={loadMenus}
          showToast={showToast}
        />
      )}
      {showAssignUser && (
        <AssignUserModal
          deptId={deptId}
          currentUserEmails={assignedUserEmails}
          onClose={() => setShowAssignUser(false)}
          onAssigned={loadUsers}
          showToast={showToast}
        />
      )}

      {removeTarget && (
        <ConfirmRemoveModal
          target={removeTarget}
          busy={removeBusy}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}