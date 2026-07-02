'use client';

import { useState } from 'react';
import { ApiUser } from '@/types';
import { UserDetail } from '@/types/users';
import { fetchUser, fetchUserDepartments } from '@/lib/api/users';

export function useUserDetail() {
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const openDetail = async (user: ApiUser) => {
    setSelected(user as UserDetail);
    setVisible(true);
    setDetailLoading(true);
    try {
      const [userDetail, departments] = await Promise.all([
        fetchUser(user.id),
        fetchUserDepartments(user.id),
      ]);
      setSelected({ ...userDetail, departments });
    } catch (err) {
      console.error('Failed to load user detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setSelected(null), 250);
  };

  return { selected, detailLoading, visible, openDetail, closeModal };
}