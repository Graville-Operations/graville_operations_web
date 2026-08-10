"use client";

import { useEffect, useState } from "react";
import { getRole } from "@/lib/auth";
import { ApiUser } from "@/types/users";
import { fetchUsers } from "@/lib/api/users";
import {
  fetchMyPermits,
  fetchCategories,
  fetchPermitDetailsBatch,
} from "@/lib/api/permits";
import { PermitListItem, PermitDetail, PermitCategory } from "@/types/permits";

const MANAGER_ROLES = ["DIRECTOR", "DEPARTMENT_MANAGER"];
const FIELD_OPERATOR = "FIELD_OPERATOR";

export { STATUS_TABS } from "@/types/permits";

export function usePermitsList() {
  const role = getRole();
  const isManager = MANAGER_ROLES.includes(role ?? "");
  const isFieldOp = role === FIELD_OPERATOR;

  const [activeTab, setActiveTab] = useState<"permits" | "categories">("permits");
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [permits, setPermits] = useState<PermitListItem[]>([]);
  const [detailCache, setDetailCache] = useState<Record<number, PermitDetail>>({});
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<PermitDetail | null>(null);
  const [draftEdit, setDraftEdit] = useState<PermitDetail | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [permitsList, cats, userList] = await Promise.all([
          fetchMyPermits(),
          fetchCategories(),
          fetchUsers(),
        ]);
        setPermits(permitsList);
        setCategories(cats);
        setUsers(userList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
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
  const refresh = async () => {
    try {
      const list = await fetchMyPermits();
      setPermits(list);
      setDetailCache({});
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = permits.filter((p) => {
    const matchStatus = activeStatus === "All" || p.status === activeStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q || p.title.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q));
  });

  const counts = permits.reduce(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }),
    {} as Record<string, number>
  );

  const statCounts = [
    permits.length,
    (counts["Pending"] || 0) + (counts["In Review"] || 0),
    counts["Approved"] || 0,
    counts["Rejected"] || 0,
  ];
  const openPermit = (permit: PermitListItem) => {
    const detail = detailCache[permit.id];
    if (!detail) return; 
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    detail.status === "Draft" ? setDraftEdit(detail) : setSelected(detail);
  };

  return {
    isManager, isFieldOp,
    activeTab, setActiveTab,
    categories, users,
    isLoading,
    search, setSearch,
    activeStatus, setActiveStatus,
    selected, setSelected,
    draftEdit, setDraftEdit,
    filtered, counts, statCounts,
    totalCount: permits.length,
    openPermit, refresh,
  };
}