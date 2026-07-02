'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useAssignRole } from '@/hooks/users/useAssignRole';
import { RoleSelector } from '@/components/users/RoleSelector';
import { UserSelectList } from '@/components/users/UserSelectList';

export default function AssignRolePage() {
  const router = useRouter();
  const {
    roles, filtered, search, setSearch, selectedUserIds, toggleUser,
    isAllSelected, toggleSelectAll, selectedRoleId, setSelectedRoleId,
    isLoading, assigning, error, success, handleAssign,
  } = useAssignRole();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Assign Role</h2>
          <p className="text-sm text-blue-200/60">Select a role and assign it to one or more users</p>
        </div>
      </div>

      <RoleSelector roles={roles} selectedRoleId={selectedRoleId} onChange={setSelectedRoleId} />

      <UserSelectList
        users={filtered}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        selectedUserIds={selectedUserIds}
        onToggleUser={toggleUser}
        isAllSelected={isAllSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl">
          {success}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={assigning || selectedUserIds.size === 0 || !selectedRoleId}
          className="flex-1 flex items-center justify-center gap-2 bg-[#33907C] hover:bg-[#2a7a69] text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} />
          {assigning
            ? 'Assigning...'
            : `Assign Role${selectedUserIds.size > 1 ? ` to ${selectedUserIds.size} Users` : ''}`
          }
        </button>
      </div>
    </div>
  );
}