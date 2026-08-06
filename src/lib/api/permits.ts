import axios from "axios";
import api from "@/lib/api";
import { API } from "@/lib/endpoints";
import { unwrapArray, unwrapObject } from "@/lib/api-response";
import {
  normalisePermitListItems,
  normalisePermitDetail,
  normalisePendingApprovals,
  normalisePermitCategories,
  type RawPermitListItem,
  type RawPermitDetail,
  type RawPermitApproval,
  type RawPermitCategory,
} from "@/lib/mappers/permit-mappers";
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

export async function fetchMyPermits(): Promise<PermitListItem[]> {
  const { data } = await api.get(API.permits.myPermits);
  return normalisePermitListItems(unwrapArray<RawPermitListItem>(data));
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
  const items = normalisePermitListItems(unwrapArray<RawPermitListItem>(data));
  const inner = unwrapObject<{ total?: number }>(data);
  const total = inner?.total ?? items.length;
  return { items, total, skip };
}

export async function fetchPermitDetail(id: number): Promise<PermitDetail | null> {
  const { data } = await api.get(API.permits.get(id));
  const raw = unwrapObject<RawPermitDetail | null>(data);
  return raw ? normalisePermitDetail(raw) : null;
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
  return normalisePendingApprovals(unwrapArray<RawPermitApproval>(data));
}

export async function fetchCategories(): Promise<PermitCategory[]> {
  const { data } = await api.get(API.permits.categories);
  return normalisePermitCategories(unwrapArray<RawPermitCategory>(data));
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