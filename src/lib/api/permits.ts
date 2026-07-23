/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "@/lib/api";
import { API } from "@/lib/endpoints";
import {
  PermitListItem,
  PermitDetail,
  PermitCategory,
  PendingApprovalItem,
  CreatePermitPayload,
} from "@/types/permits";

export function resolveErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Network error. Check your internet connection.";
    const data = err.response.data;
    if (typeof data?.message === "string") return data.message;
    return `${fallback} (${err.response.status}).`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
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
  // Endpoint path intentionally matches backend's "my-pemits" typo — see endpoints.ts.
  const { data } = await api.get(API.permits.myPermits);
  return unwrapList<PermitListItem>(data);
}

interface FetchAllPermitsParams {
  skip?: number;
  limit?: number;
  status?: string;
}

interface FetchAllPermitsResult {
  items: PermitListItem[];
  total: number;
  skip: number;
}

export async function fetchAllPermits(params: FetchAllPermitsParams = {}): Promise<FetchAllPermitsResult> {
  const { skip = 0, limit = 20, status } = params;
  const { data } = await api.get(API.permits.all, {
    params: { skip, limit, ...(status ? { status } : {}) },
  });
  const payload = unwrap<{ items?: PermitListItem[]; total?: number } | PermitListItem[]>(data);
  const items = Array.isArray(payload) ? payload : payload?.items ?? [];
  const total = Array.isArray(payload) ? items.length : payload?.total ?? items.length;
  return { items, total, skip };
}

export async function fetchPermitDetail(id: number): Promise<PermitDetail | null> {
  const { data } = await api.get(API.permits.get(id));
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
  const { data } = await api.post(API.permits.create, payload);
  if (data?.code !== 200) throw new Error(data?.message || "Failed to create permit.");
  return data.data;
}

export async function submitPermit(id: number) {
  const { data } = await api.post(API.permits.submit(id), {});
  if (data?.code !== 200) throw new Error(data?.message || "Failed to submit permit.");
  return data;
}

export async function takePermitAction(
  id: number,
  status: "APPROVED" | "REJECTED",
  comment?: string | null
) {
  const { data } = await api.post(API.permits.takeAction(id), {
    status,
    comment: comment || null,
  });
  if (data?.code !== 200) throw new Error(data?.message || "Action failed.");
  return data;
}

export async function fetchPendingApprovals(): Promise<PendingApprovalItem[]> {
  const { data } = await api.get(API.permits.pending);
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
  const { data } = await api.get(API.permits.categories);
  return unwrapList<any>(data).map(normaliseCategory);
}

export async function createCategory(input: { name: string; description: string | null }) {
  await api.post(API.permits.createCategory, input);
}

export async function updateCategory(
  id: number,
  input: Partial<{ name: string; description: string | null; is_active: boolean }>
) {
  await api.patch(API.permits.updateCategory(id), input);
}

export async function deactivateCategory(id: number) {
  await api.patch(API.permits.updateCategory(id), { is_active: false });
}