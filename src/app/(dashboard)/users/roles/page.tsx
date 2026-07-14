'use client';

import Link from 'next/link';
import { Plus, UserCog } from 'lucide-react';
import { useRoles } from '@/hooks/users/useRoles';
import { RolesGrid } from '@/components/users/RolesGrid';
import { RoleFormModal } from '@/components/users/RoleFormModal';
import { ShimmerStyle } from '@/components/shared/Shimmer';
import { ROUTES } from '@/lib/routes';

export default function RolesPage() {
  const {
    roles, isLoading, showCreate, editingRole, formData, saving, error,
    openCreate, openEdit, closeModal, updateField, handleSave, handleDelete,
  } = useRoles();

  return (
    <>
      <ShimmerStyle />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Roles & Permissions</h2>
            <p className="text-sm text-blue-200/60">Manage user roles and access levels</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.users.assign}
              className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <UserCog size={16} />
              Assign Role
            </Link>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Role
            </button>
          </div>
        </div>

        <RolesGrid roles={roles} isLoading={isLoading} onEdit={openEdit} onDelete={handleDelete} />

        <RoleFormModal
          open={showCreate}
          editingRole={editingRole}
          formData={formData}
          saving={saving}
          error={error}
          onChange={updateField}
          onSave={handleSave}
          onClose={closeModal}
        />
      </div>
    </>
  );
}