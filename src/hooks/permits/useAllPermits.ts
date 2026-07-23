"use client";

import { useEffect, useState } from "react";
import { fetchAllPermits, fetchPermitDetailsBatch, fetchPermitDetail, resolveErrorMessage } from "@/lib/api/permits";
import { PermitListItem, PermitDetail } from "@/types/permits";

const PAGE_SIZE = 20;

export const STATUS_TABS = ["All", "Draft", "Pending", "In Review", "Approved", "Rejected"] as const;

export function useAllPermits() {
  const isAuthorized = true;

  const [permits, setPermits] = useState<PermitListItem[]>([]);
  const [detailCache, setDetailCache] = useState<Record<number, PermitDetail>>({});
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [selected, setSelected] = useState<PermitDetail | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const load = async (nextSkip = skip, status = activeStatus) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const result = await fetchAllPermits({
        skip: nextSkip,
        limit: PAGE_SIZE,
        status: status === "All" ? undefined : status,
      });
      setPermits(result.items);
      setTotal(result.total);
      setSkip(result.skip);
    } catch (err) {
      console.error("Failed to load all permits:", err);
      setLoadError(resolveErrorMessage(err, "Couldn't load permits. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(0, activeStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);
  useEffect(() => {
    if (permits.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const cache = await fetchPermitDetailsBatch(permits.map((p) => p.id));
        if (!cancelled) setDetailCache(cache);
      } catch (err) {
        console.error("Failed to prefetch permit details:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [permits]);

  const filtered = permits.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
  });
  const openPermit = async (permit: PermitListItem) => {
    setOpenError(null);
    const cached = detailCache[permit.id];
    if (cached) {
      setSelected(cached);
      return;
    }
    try {
      setOpeningId(permit.id);
      const detail = await fetchPermitDetail(permit.id);
      if (!detail) {
        setOpenError("Couldn't load this permit. Please try again.");
        return;
      }
      setDetailCache((prev) => ({ ...prev, [permit.id]: detail }));
      setSelected(detail);
    } catch (err) {
      console.error(`Failed to load permit ${permit.id}:`, err);
      setOpenError(resolveErrorMessage(err, "Couldn't load this permit. Please try again."));
    } finally {
      setOpeningId(null);
    }
  };

  const nextPage = () => {
    if (skip + PAGE_SIZE < total) load(skip + PAGE_SIZE);
  };
  const prevPage = () => {
    if (skip > 0) load(Math.max(0, skip - PAGE_SIZE));
  };

  return {
    isAuthorized,
    isLoading,
    loadError,
    search, setSearch,
    activeStatus, setActiveStatus,
    filtered, total, skip, limit: PAGE_SIZE,
    nextPage, prevPage,
    selected, setSelected,
    openPermit, openError,
  };
}