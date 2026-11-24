import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import type { SiteWorkerDetail } from '@/types/site-worker-detail';

interface WorkerListItemDTO {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  status?: string | null;
  skill?: { name?: string | null } | null;
}

interface WorkerDetailDTO {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  national_id?: string | null;
  phone?: string | null;
  status?: string | null;
  skill?: { name?: string | null; amount?: number | null } | null;
  attendances?: { id: number; date?: string | null; checkInTime?: string | null }[] | null;
  tasksAssigned?: {
    id: number;
    name?: string | null;
    percentage?: number | null;
    description?: string | null;
    status?: string | null;
  }[] | null;
}

const PAGE_SIZE = 100; // backend maximum for /workers/list-by-id

/** Every worker on a site (pages through the backend's 100-per-page limit). */
export async function fetchAllSiteWorkers(siteId: number) {
  const all: WorkerListItemDTO[] = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const { data } = await api.get(API.workers.listBySite(siteId), {
      params: { skip, limit: PAGE_SIZE },
    });
    const page = unwrapArray<WorkerListItemDTO>(data);
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all.map((w) => ({
    id: w.id,
    fullName: `${w.first_name ?? ''} ${w.last_name ?? ''}`.trim() || 'Unnamed worker',
    status: w.status ?? '',
    skillName: w.skill?.name ?? null,
  }));
}

export async function fetchSiteWorkerDetail(workerId: number): Promise<SiteWorkerDetail> {
  const { data } = await api.get(API.workers.detail(workerId));
  const w = unwrapObject<WorkerDetailDTO>(data);
  const firstName = w.first_name ?? '';
  const lastName = w.last_name ?? '';
  return {
    id: w.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'Unnamed worker',
    nationalId: w.national_id ?? null,
    phone: w.phone ?? null,
    status: w.status ?? '',
    skillName: w.skill?.name ?? null,
    dailyRate: typeof w.skill?.amount === 'number' ? w.skill.amount : null,
    attendances: (w.attendances ?? []).map((a) => ({
      id: a.id,
      date: a.date ?? '',
      checkInTime: a.checkInTime ?? '',
    })),
    tasks: (w.tasksAssigned ?? []).map((t) => ({
      id: t.id,
      name: t.name ?? '',
      percentage: t.percentage ?? 0,
      description: t.description ?? null,
      status: t.status ?? '',
    })),
  };
}
