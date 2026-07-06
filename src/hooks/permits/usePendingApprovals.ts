"use client";

import { useEffect, useState } from "react";
import {
  fetchPendingApprovals,
  fetchPermitDetailsBatch,
  takePermitAction,
  resolveErrorMessage,
} from "@/lib/api/permits";
import { PendingApprovalItem, PermitDetail } from "@/types/permits";

export function usePendingApprovals() {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [permitCache, setPermitCache] = useState<Record<number, PermitDetail>>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<PermitDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const list = await fetchPendingApprovals();
      setApprovals(list);
      // Pre-fetch all permit details so clicking a row opens instantly
      const details = await fetchPermitDetailsBatch(list.map((item) => item.permit_id));
      setPermitCache(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPending(); }, []);

  const filtered = approvals.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const d = permitCache[a.permit_id];
    return d?.title?.toLowerCase().includes(q) || d?.permitCategory?.toLowerCase().includes(q);
  });

  const openDetail = (item: PendingApprovalItem) => {
    const detail = permitCache[item.permit_id];
    if (!detail) return;
    setActionError(null);
    setSelected(detail);
  };

  const closeDetail = () => {
    setSelected(null);
    setActionError(null);
    setShowRejectModal(false);
    setRejectComment("");
  };

  const takeAction = async (action: "APPROVED" | "REJECTED", commentText?: string) => {
    if (!selected) return;
    setActionError(null);
    try {
      setActionLoading(true);
      await takePermitAction(selected.id, action, commentText);
      closeDetail();
      fetchPending();
    } catch (err) {
      setActionError(resolveErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setActionLoading(false);
    }
  };

  const approve = () => takeAction("APPROVED");
  const openReject = () => { setRejectComment(""); setShowRejectModal(true); };
  const confirmReject = () => takeAction("REJECTED", rejectComment);
  const cancelReject = () => { setShowRejectModal(false); setRejectComment(""); };

  return {
    isLoading, search, setSearch, filtered, permitCache,
    selected, openDetail, closeDetail,
    actionLoading, actionError,
    showRejectModal, rejectComment, setRejectComment,
    approve, openReject, confirmReject, cancelReject,
  };
}