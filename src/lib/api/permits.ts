/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import {
  PermitListItem,
  PermitDetail,
  PermitCategory,
  PendingApprovalItem,
  CreatePermitPayload,
} from "@/types/permits";
export function resolveErrorMessage(err: unknown, fallback: string): string {
  const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return axiosMessage || getApiErrorMessage(err, fallback);
}


function unwrap<T>(data: unknown): T {
  return ((data as { data?: unknown })?.data ?? data) as T;
}

function unwrapList<T>(data: unknown): T[] {
  const payload = unwrap<T[] | { items?: T[]; results?: T[] }>(data);
  if (Array.isArray(payload)) return payload;
  return (payload as { items?: T[]; results?: T[] })?.items
    ?? (payload as { items?: T[]; results?: T[] })?.results
    ?? [];
}

export async function fetchMyPermits(): Promise<PermitListItem[]> {
  const { data } = await api.get("/permits/my-pemits");
  return unwrapList<PermitListItem>(data);
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
        /* skip silently — a single failed detail shouldn't break the list */
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
  comment?: string | null
) {
  const { data } = await api.post(`/permits/take-action/${id}`, {
    status,
    comment: comment || null,
  });
  if (data?.code !== 200) throw new Error(data?.message || "Action failed.");
  return data;
}

export async function fetchPendingApprovals(): Promise<PendingApprovalItem[]> {
  const { data } = await api.get("/permits/pending");
  return unwrapList<PendingApprovalItem>(data);
}

export function normaliseCategory(r: any): PermitCategory {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    is_active: r.is_active ?? r.isActive ?? true,
  };
}

export async function fetchCategories(): Promise<PermitCategory[]> {
  const { data } = await api.get("/permits/categories");
  return unwrapList<any>(data).map(normaliseCategory);
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
