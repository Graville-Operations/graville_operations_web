import { Search, Shield } from 'lucide-react';
import { ApiUser } from '@/types/users';
import { RoleBadge } from './RoleBadge';

interface UsersTableProps {
  users: ApiUser[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (user: ApiUser) => void;
}

export function UsersTable({ users, isLoading, search, onSearchChange, onSelect }: UsersTableProps) {
  return (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm text-white placeholder-white/30"
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/40">
            <Shield size={48} className="mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['Name', 'Email', 'Role', 'Phone'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr
                  key={user.ref_id}
                  onClick={() => onSelect(user)}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#33907C] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? '?'}
                        </span>
                      </div>
                      <span className="font-medium text-white text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{user.email}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{user.phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}