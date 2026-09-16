import { Shield, AlertTriangle } from 'lucide-react';
import { Role } from '@/types/users';
import { RoleCard } from './RoleCard';
import { RoleCardSkeleton } from './RoleCardSkeleton';

interface RolesGridProps {
  roles: Role[];
  isLoading: boolean;
  loadError?: string | null;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export function RolesGrid({ roles, isLoading, loadError, onEdit, onDelete }: RolesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <RoleCardSkeleton key={i} />)}
      </div>
    );
  }
  if (roles.length === 0) {
    if (loadError) {
      return (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-2">
          <AlertTriangle size={40} className="text-red-300 opacity-70" />
          <p className="text-red-200 text-sm font-medium">Couldn't load roles</p>
          <p className="text-red-200/60 text-xs">{loadError}</p>
        </div>
      );
    }
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-white/40">
        <Shield size={48} className="mb-3 opacity-30" />
        <p>No roles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loadError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-2.5 rounded-xl text-xs">
          <AlertTriangle size={14} className="shrink-0" />
          Showing previously loaded roles — refresh failed: {loadError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}