import { Role, Department, NewUserFormState } from '@/types/users';

interface NewUserFormProps {
  form: NewUserFormState;
  roles: Role[];
  departments: Department[];
  error: string;
  isLoading: boolean;
  onChange: (key: keyof NewUserFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30';

const selectClass =
  'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white [&>option]:bg-[#0d1b2a] [&>option]:text-white';

export function NewUserForm({ form, roles, departments, error, isLoading, onChange, onSubmit, onCancel }: NewUserFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {([
          { label: 'First Name', key: 'first_name' as const, required: true },
          { label: 'Last Name',  key: 'last_name' as const,  required: true },
        ]).map(({ label, key, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-blue-100/80 mb-1">
              {label} {required && '*'}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
              required={required}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100/80 mb-1">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          required
          placeholder="user@graville.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100/80 mb-1">Phone Number</label>
        <input
          type="tel"
          value={form.phone_no}
          onChange={(e) => onChange('phone_no', e.target.value)}
          placeholder="+254700000000"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Role *</label>
          <select
            value={form.role_id}
            onChange={(e) => onChange('role_id', e.target.value)}
            required
            className={selectClass}
          >
            <option value="">Select role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100/80 mb-1">Department</label>
          <select
            value={form.department_id}
            onChange={(e) => onChange('department_id', e.target.value)}
            className={selectClass}
          >
            <option value="">Select department...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#33907C] text-white px-4 py-3 rounded-lg hover:bg-[#2a7a69] transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}