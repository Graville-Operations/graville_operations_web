import { Search, Check, Users } from 'lucide-react';
import { ApiUser } from '@/types';

interface UserSelectListProps {
  users: ApiUser[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedUserIds: Set<number>;
  onToggleUser: (id: number) => void;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
}

export function UserSelectList({
  users, isLoading, search, onSearchChange,
  selectedUserIds, onToggleUser, isAllSelected, onToggleSelectAll,
}: UserSelectListProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isAllSelected
                ? 'bg-[#33907C] border-[#33907C]'
                : 'border-white/30 hover:border-white/60'
            }`}>
              {isAllSelected && <Check size={12} className="text-white" />}
            </div>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-white/40">
            {selectedUserIds.size} selected · {users.length} shown
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-white/40">
          <Users size={40} className="mb-2 opacity-30" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {users.map((user) => {
            const isSelected = selectedUserIds.has(user.id);
            return (
              <button
                key={user.id}
                onClick={() => onToggleUser(user.id)}
                className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-all ${
                  isSelected ? 'bg-[#33907C]/15' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#33907C] border-[#33907C]'
                    : 'border-white/30'
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>

                <div className="w-9 h-9 bg-[#33907C]/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>

                <span className="text-xs text-white/40 shrink-0">{user.role ?? '—'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}