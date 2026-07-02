'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/hooks/users/useUsers';
import { useUserDetail } from '@/hooks/users/useUserDetail';
import { UsersTable } from '@/components/users/UsersTable';
import { UserDetailModal } from '@/components/users/UserDetailModal';

export default function UsersPage() {
  const { filtered, search, setSearch, isLoading } = useUsers();
  const { selected, detailLoading, visible, openDetail, closeModal } = useUserDetail();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Users</h2>
          <p className="text-sm text-blue-200/60">{filtered.length} users found</p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-[#33907C] text-white px-4 py-2 rounded-xl hover:bg-[#2a7a69] transition-colors text-sm font-medium"
        >
          <UserPlus size={16} />
          Add New User
        </Link>
      </div>

      <UsersTable
        users={filtered}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        onSelect={openDetail}
      />

      <UserDetailModal user={selected} visible={visible} loading={detailLoading} onClose={closeModal} />
    </div>
  );
}