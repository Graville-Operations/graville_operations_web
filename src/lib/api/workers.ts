import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { extractNestedList as extractList } from '@/lib/api-response';
import type { WorkerType, SkillType } from '@/types/worker-dashboard';

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