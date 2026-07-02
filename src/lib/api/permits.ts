/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import {
  PermitListItem,
  PermitDetail,
  PermitCategory,
  PendingApprovalItem,
  CreatePermitPayload,
} from "@/types/permits";

export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
}

// ─── Response unwrapping ───────────────────────────────────────────────────
// Backend responses aren't 100% consistent about where the array lives
// (data.items / data.results / data directly) — normalise once, here.

function unwrapArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === "object") {
    const obj = response;
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data;
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}

export function normaliseCategory(r: any): PermitCategory {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    is_active: r.is_active ?? r.isActive ?? true,
  };
}

export async function fetchMyPermits(): Promise<PermitListItem[]> {
  const { data } = await api.get("/permits/my-pemits");
  return unwrapArray<PermitListItem>(data);
}

export async function fetchPermitDetail(id: number): Promise<PermitDetail | null> {
  const { data } = await api.get(`/permits/get/${id}`);
  return (data?.data as PermitDetail) ?? null;
}
export async function fetchPermitDetailsBatch(ids: number[]): Promise<Record<number, PermitDetail>> {
  const cache: Record<number, PermitDetail> = {};
  await Promise.all(
    ids.map(async (id) => {
      try {
        const detail = await fetchPermitDetail(id);
        if (detail) cache[id] = detail;
      } catch {
       
      }
    })
  );
  return cache;
}

export async function createPermit(payload: CreatePermitPayload) {
  const { data } = await api.post("/permits/create", payload);
  if (data?.code !== 200) throw new Error(data?.message || "Failed to create permit.");
  return data.data;
}

export async function submitPermit(id: number) {
  const { data } = await api.post(`/permits/submit/${id}`, {});
  if (data?.code !== 200) throw new Error(data?.message || "Failed to submit permit.");
  return data;
}

export async function takePermitAction(
  id: number,
  status: "APPROVED" | "REJECTED",
  comment?: string
) {
  const { data } = await api.post(`/permits/take-action/${id}`, {
    status,
    comment: comment || null,
  });
  if (data?.code !== 200) throw new Error(data?.message || "Action failed");
  return data;
}

export async function fetchPendingApprovals(): Promise<PendingApprovalItem[]> {
  const { data } = await api.get("/permits/pending");
  return unwrapArray<PendingApprovalItem>(data);
}

export async function fetchCategories(): Promise<PermitCategory[]> {
  const { data } = await api.get("/permits/categories");
  return unwrapArray<any>(data).map(normaliseCategory);
}

export async function createCategory(input: { name: string; description: string | null }) {
  await api.post("/permits/category/create", input);
}

export async function updateCategory(
  id: number,
  input: Partial<{ name: string; description: string | null; is_active: boolean }>
) {
  await api.patch(`/permits/category/${id}`, input);
}

export async function deactivateCategory(id: number) {
  await api.patch(`/permits/category/${id}`, { is_active: false });
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const { data } = await api.get("/users/list");
  const up = data?.data ?? data;
  return Array.isArray(up) ? up : up?.items ?? [];
}