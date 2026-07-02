'use client';

import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/hooks/users/useCreateUser';
import { NewUserForm } from '@/components/users/NewUserForm';

export default function NewUserPage() {
  const router = useRouter();
  const { roles, departments, form, updateField, handleSubmit, isLoading, error } = useCreateUser();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Add New User</h2>
        <p className="text-sm text-blue-200/60">Create a new account for a team member</p>
      </div>

      <NewUserForm
        form={form}
        roles={roles}
        departments={departments}
        error={error}
        isLoading={isLoading}
        onChange={updateField}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}