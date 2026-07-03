import { X, Check } from 'lucide-react';
import { Role, RoleFormState } from '@/types/users';

interface RoleFormModalProps {
  open: boolean;
  editingRole: Role | null;
  formData: RoleFormState;
  saving: boolean;
  error: string;
  onChange: (key: keyof RoleFormState, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function RoleFormModal({ open, editingRole, formData, saving, error, onChange, onSave, onClose }: RoleFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0d1b2a] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">
            {editingRole ? 'Edit Role' : 'Create Role'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. Site Manager"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Describe what this role can do..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#33907C] hover:bg-[#2a7a69] text-white transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Check size={15} />
              {saving ? 'Saving...' : editingRole ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}