import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { parseList } from '@/lib/utils/parse-list';
import { DriverTask, CreateDriverTaskPayload, TransferBrief } from '@/types/driver-task';
import { DriverTaskStatus } from '@/types/enums/driver-task';
import { MaterialItem, ToolItem } from '@/types/store';

export const driverTasksService = {
  async listAll(params?: { status?: DriverTaskStatus; skip?: number; limit?: number }) {
    const { data } = await api.get(API.driverTasks.all, { params });
    // Response shape (confirmed via Swagger): { code, data: { items, total, skip, limit }, message }
    const items: DriverTask[] = data?.data?.items ?? [];
    const total: number = data?.data?.total ?? items.length;
    return { items, total };
  },

  async create(payload: CreateDriverTaskPayload): Promise<DriverTask> {
    const { data } = await api.post(API.driverTasks.create, payload);
    // Response shape: { code, data: {...task}, message }
    return data?.data as DriverTask;
  },
};

export const transfersService = {
  async list(): Promise<TransferBrief[]> {
    const { data } = await api.get(API.transfers.all);
    return (data?.data?.items ?? []) as TransferBrief[];
  },
};
export const siteMaterialsService = {
  async list(siteId: number): Promise<MaterialItem[]> {
    const { data } = await api.get(API.stores.materials(siteId));
    return parseList(data) as MaterialItem[];
  },
};

export const siteToolsService = {
  async list(siteId: number): Promise<ToolItem[]> {
    const { data } = await api.get(API.stores.tools(siteId));
    return parseList(data) as ToolItem[];
  },
};