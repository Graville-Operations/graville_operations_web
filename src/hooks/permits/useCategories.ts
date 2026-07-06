"use client";

import { useCallback, useEffect, useState } from "react";
import { PermitCategory } from "@/types/permits";
import { fetchCategories, deactivateCategory, resolveErrorMessage } from "@/lib/api/permits";

export function useCategories() {
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PermitCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PermitCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refetch(); }, [refetch]);

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (cat: PermitCategory) => { setEditTarget(cat); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deactivateCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(resolveErrorMessage(err, "Failed to deactivate category."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return {
    categories, loading, refetch,
    showModal, editTarget, openCreate, openEdit, closeModal,
    deleteTarget, setDeleteTarget, deleting, deleteError, setDeleteError,
    handleDeleteConfirm,
  };
}