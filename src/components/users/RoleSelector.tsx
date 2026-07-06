import { Role } from '@/types/users';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: number | null;
  onChange: (id: number) => void;
}

export function RoleSelector({ roles, selectedRoleId, onChange }: RoleSelectorProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg">
      <label className="block text-sm font-medium text-blue-100/80 mb-2">
        Select Role to Assign
      </label>
      <select
        value={selectedRoleId ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm [&>option]:bg-[#0d1b2a]"
      >
        <option value="">Select a role...</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    </div>
  );
}