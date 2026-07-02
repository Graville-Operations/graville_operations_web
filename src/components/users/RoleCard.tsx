import { Shield, Pencil, Trash2 } from 'lucide-react';
import { Role } from '@/types/users';
import { formatDate } from '@/lib/utils/date';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#33907C]/20 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={18} className="text-[#33907C]" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{role.name}</p>
            <p className="text-xs text-white/40 mt-0.5">
              {formatDate(role.created_at ?? role.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(role)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(role.id)}
            className="p-1.5 text-red-400/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-white/50 leading-relaxed">
        {role.description || '—'}
      </p>
    </div>
  );
}