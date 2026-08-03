import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import type { WorkerType, WorkerBrief, SkillType } from '@/types/worker-dashboard';

function extractList(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.data)) return obj.data;
  const nested = obj.data as Record<string, unknown> | undefined;
  if (nested && Array.isArray(nested.items)) return nested.items;
  return [];
}

function extractTotal(raw: unknown): number {
  const obj = raw as Record<string, unknown>;
  if (typeof obj?.total === 'number') return obj.total;
  const nested = obj?.data as Record<string, unknown> | undefined;
  if (typeof nested?.total === 'number') return nested.total;
  return 0;
}

export async function fetchWorkerTypes(
  skip = 0,
  limit = 20
): Promise<{ items: WorkerType[]; total: number }> {
  const res = await api.get(API.workers.skills, { params: { skip, limit } });
  return {
    items: extractList(res.data) as WorkerType[],
    total: extractTotal(res.data),
  };
}

export async function createWorkerType(payload: {
  name: string;
  amount: number;
  skill: SkillType;
}): Promise<WorkerType> {
  const res = await api.post(API.workers.createSkill, payload);
  return res.data?.data ?? res.data;
}

export async function fetchWorkersBySite(
  siteId: number,
  skip = 0,
  limit = 50
): Promise<{ items: WorkerBrief[]; total: number }> {
  const res = await api.get(API.workers.listBySite(siteId), { params: { skip, limit } });
  return {
    items: extractList(res.data) as WorkerBrief[],
    total: extractTotal(res.data),
  };
}