'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Subtitle, Label, Body } from '@/components/ui/typography';
import { useDepartments } from '@/hooks/department/use-departments';
import { CreateDepartmentPayload, Department } from '@/types/department';
import { ROUTES } from '@/lib/routes';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white z-60 shadow-xl pointer-events-none
        ${type === 'success' ? 'bg-[#33907c]' : 'bg-red-600'}`}
    >
      <Label size="sm" as="span" className="text-white normal-case tracking-normal">
        {message}
      </Label>
    </div>
  );
}

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MenusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
  </svg>
);
const SpinnerIcon = ({ size = 14 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function CreateDeptModal({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  /** Delegates the actual save (and error message extraction) to the hook/service layer. */
  onSubmit: (payload: CreateDepartmentPayload) => Promise<void>;
  /** When provided, the modal edits an existing department instead of creating one. */
  initial?: Department;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, description });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? 'Failed to update department.' : 'Failed to create department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-[#0d1528] border border-white/10 rounded-2xl flex flex-col overflow-hidden"
        style={{ animation: 'fadeUp 0.22s ease' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--gv-brand) 18%, transparent)',
                border: '1px solid color-mix(in srgb, var(--gv-brand) 35%, transparent)',
                color: 'var(--gv-brand)',
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Title size="md" as="h2">
                {isEdit ? 'Edit Department' : 'New Department'}
              </Title>
              <Body size="sm" muted className="mt-0.5">
                {isEdit ? 'Update the details below' : 'Fill in the details below to get started'}
              </Body>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-7 py-6 space-y-5">
          <div className="space-y-2">
            <label>
              <Label size="sm" subtle>
                Department Name{' '}
              </Label>
              <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Finance, Operations, Engineering…"
              className="w-full gv-input px-4 py-3 outline-none text-white text-body-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-baseline gap-2">
              <Label size="sm" subtle>Description</Label>
              <Body size="sm" subtle as="span">— optional</Body>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this department do?"
              rows={4}
              className="w-full gv-input px-4 py-3 outline-none resize-none text-white text-body-sm"
            />
          </div>
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/25">
              <span className="text-red-400 text-base leading-none mt-0.5">⚠</span>
              <Body size="sm" as="p" className="text-red-400">{error}</Body>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="gv-btn-outline flex-1 justify-center py-3 text-label-sm tracking-[0.15em] uppercase font-mono font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-40 text-label-sm tracking-[0.15em] uppercase font-mono font-medium"
            style={{ background: 'var(--gv-brand)', color: '#fff' }}
          >
            {isSubmitting ? <SpinnerIcon /> : isEdit ? <EditIcon /> : <PlusIcon />}
            {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Department')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:scale(0.96) translateY(10px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}

function DeleteDeptModal({
  dept,
  onClose,
  onSubmit,
}: {
  dept: Department;
  onClose: () => void;
  onSubmit: (id: number, reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(dept.id, reason);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit deletion request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0d1528] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <Title size="sm" as="h2">Delete department?</Title>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="text-white/30 hover:text-white transition-colors p-1 -mt-1 -mr-1 disabled:opacity-40">
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 pb-5 space-y-3">
          <Body size="sm" muted>
            This submits a deletion request for{' '}
            <span className="font-semibold text-white/80">{dept.name}</span>. It is removed once the request is approved.
          </Body>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for deletion (at least 10 characters)"
            rows={3}
            className="w-full gv-input px-4 py-3 outline-none resize-none text-white text-body-sm"
          />
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25">
              <Body size="sm" as="p" className="text-red-400">{error}</Body>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="gv-btn-outline px-4 py-1.5 text-sm disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting || reason.trim().length < 10}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
            {isSubmitting && <SpinnerIcon size={12} />}
            {isSubmitting ? 'Submitting…' : 'Request Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DepartmentCard({
  dept, onClick, onEdit, onDelete,
}: {
  dept: Department; onClick: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className="gv-card p-0 overflow-hidden flex flex-col cursor-pointer transition-all"
      style={{ borderTop: '3px solid var(--gv-brand)', outline: 'none' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px color-mix(in srgb, var(--gv-brand) 22%, transparent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'color-mix(in srgb, var(--gv-brand) 22%, transparent)', color: 'var(--gv-brand)' }}
          >
            <BuildingIcon />
          </div>
          <div className="min-w-0 flex-1">
            <Subtitle size="sm" as="p" className="truncate leading-[1.3]">
              {dept.name}
            </Subtitle>
            <Body size="sm" muted as="p" className="line-clamp-2 mt-1">
              {dept.description || 'No description provided.'}
            </Body>
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
            <button type="button" title="Edit department" aria-label={`Edit ${dept.name}`} onClick={onEdit}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <EditIcon />
            </button>
            <button type="button" title="Delete department" aria-label={`Delete ${dept.name}`} onClick={onDelete}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/6" />

      <div className="px-4 py-3 pb-4 flex items-center gap-3">
        {/* Menus badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 justify-center"
          style={{ background: 'color-mix(in srgb, var(--gv-brand) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--gv-brand) 28%, transparent)' }}
        >
          <span style={{ color: 'var(--gv-brand)' }}><MenusIcon /></span>
          <Body size="sm" mono as="span" className="font-bold" style={{ color: 'var(--gv-brand)' }}>
            {dept.menusCount}
          </Body>
          <Label size="sm" as="span" className="normal-case tracking-normal" subtle>
            Menus
          </Label>
        </div>
        {/* Users badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-white/40"><UsersIcon /></span>
          <Body size="sm" mono as="span" className="font-bold text-white/80">
            {dept.usersCount}
          </Body>
          <Label size="sm" as="span" className="normal-case tracking-normal" subtle>
            Users
          </Label>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="gv-card p-0 overflow-hidden flex flex-col" style={{ borderTop: '3px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="gv-bone shrink-0 mt-0.5" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem' }} />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Bone w="70%" h="0.95rem" />
            <Bone w="100%" h="0.75rem" />
            <Bone w="55%" h="0.75rem" />
          </div>
        </div>
      </div>
      <div className="mx-4 h-px bg-white/6" />
      <div className="px-4 py-3 pb-4 flex items-center gap-3">
        <div className="gv-bone flex-1" style={{ height: '2.25rem', borderRadius: '0.75rem' }} />
        <div className="gv-bone flex-1" style={{ height: '2.25rem', borderRadius: '0.75rem' }} />
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const router = useRouter();

  const { filtered, isLoading, search, setSearch, toast, createDepartment, updateDepartment, requestDeleteDepartment } = useDepartments();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const handleCardClick = (dept: Department) => {
    router.push(ROUTES.sections.departments.detail(String(dept.id)));
  };

  return (
    <div className="space-y-6">
      <ShimmerStyle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label size="sm" as="p" className="gv-eyebrow mb-1">Sections</Label>
          <Title size="lg" as="h1">Departments</Title>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-label-sm tracking-[0.15em] uppercase font-mono font-medium text-white"
          style={{ background: 'var(--gv-brand)' }}
        >
          <PlusIcon /> Add Department
        </button>
      </div>

      {/* Search */}
      <div className="gv-input flex items-center gap-3 py-2.5 px-4">
        <SearchIcon />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search departments…"
          className="flex-1 bg-transparent outline-none placeholder:text-white/30 text-white text-body-sm"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Section label */}
      <Label size="sm" as="p" className="gv-eyebrow">
        All Departments {!isLoading && `(${filtered.length})`}
      </Label>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏢</p>
          <Body size="sm" muted>
            {search ? 'No departments match your search.' : 'No departments found.'}
          </Body>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl mx-auto text-label-sm tracking-[0.15em] uppercase font-mono font-medium"
              style={{
                background: 'color-mix(in srgb, var(--gv-brand) 13%, transparent)',
                border: '1px solid color-mix(in srgb, var(--gv-brand) 27%, transparent)',
                color: 'var(--gv-brand)',
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
              onClick={() => handleCardClick(dept)}
              onEdit={() => setEditTarget(dept)}
              onDelete={() => setDeleteTarget(dept)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}

      {showCreate && (
        <CreateDeptModal
          onClose={() => setShowCreate(false)}
          onSubmit={createDepartment}
        />
      )}

      {editTarget && (
        <CreateDeptModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(payload) => updateDepartment(editTarget.id, payload)}
        />
      )}

      {deleteTarget && (
        <DeleteDeptModal
          dept={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSubmit={requestDeleteDepartment}
        />
      )}
    </div>
  );
}