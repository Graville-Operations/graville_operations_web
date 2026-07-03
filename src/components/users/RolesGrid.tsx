import { Shield } from 'lucide-react';
import { Role } from '@/types/users';
import { RoleCard } from './RoleCard';
import { RoleCardSkeleton } from './RoleCardSkeleton';

interface RolesGridProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export function RolesGrid({ roles, isLoading, onEdit, onDelete }: RolesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <RoleCardSkeleton key={i} />)}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-white/40">
        <Shield size={48} className="mb-3 opacity-30" />
        <p>No roles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}