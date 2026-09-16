'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  driverTasksService,
  transfersService,
  siteMaterialsService,
  siteToolsService,
} from '@/lib/api/driver-tasks';
import { modesOfTransportService } from '@/lib/api/transport-service';
import {
  DriverTask,
  CreateDriverTaskPayload,
  InitiateDeliveryForm,
  TransferBrief,
} from '@/types/driver-task';
import { DriverTaskType, DriverTaskStatus } from '@/types/enums/driver-task';
import { ModeOfTransport } from '@/types/transport';
import { MaterialItem, ToolItem } from '@/types/store';
import { useConstructionSites } from '@/hooks/sites/useConstructionSites';

export function useInternalDeliveries() {
  const { sites: rawSites } = useConstructionSites();
  const sites = Array.isArray(rawSites) ? rawSites : [];

  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverTaskStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  const [transportOptions, setTransportOptions] = useState<ModeOfTransport[]>([]);
  const [transferOptions, setTransferOptions] = useState<TransferBrief[]>([]);
  const [materialsBySite, setMaterialsBySite] = useState<Record<number, MaterialItem[]>>({});
  const [toolsBySite, setToolsBySite] = useState<Record<number, ToolItem[]>>({});

  const loadTasks = useCallback(() => {
    setLoading(true);
    driverTasksService
      .listAll({ status: statusFilter ?? undefined, skip: 0, limit: 100 })
      .then(({ items }) => setTasks(Array.isArray(items) ? items : []))
      .catch((err) => {
        console.error('[useInternalDeliveries] loadTasks failed:', err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    modesOfTransportService.list().then((r) => setTransportOptions(Array.isArray(r) ? r : [])).catch((err) => {
      console.error('[useInternalDeliveries] load transport options failed:', err);
    });
    transfersService.list().then((r) => setTransferOptions(Array.isArray(r) ? r : [])).catch((err) => {
      console.error('[useInternalDeliveries] load transfer options failed:', err);
    });
  }, []);

  const loadMaterialsForSite = useCallback((siteId: number) => {
    if (materialsBySite[siteId]) return;
    siteMaterialsService.list(siteId)
      .then((items) => setMaterialsBySite((prev) => ({ ...prev, [siteId]: Array.isArray(items) ? items : [] })))
      .catch((err) => {
        console.error('[useInternalDeliveries] loadMaterialsForSite failed:', err);
      });
  }, [materialsBySite]);

  const loadToolsForSite = useCallback((siteId: number) => {
    if (toolsBySite[siteId]) return;
    siteToolsService.list(siteId)
      .then((items) => setToolsBySite((prev) => ({ ...prev, [siteId]: Array.isArray(items) ? items : [] })))
      .catch((err) => {
        console.error('[useInternalDeliveries] loadToolsForSite failed:', err);
      });
  }, [toolsBySite]);

  const siteNameById = useMemo(() => {
    const map: Record<number, string> = {};
    (sites as Array<{ id: number; name: string }>).forEach((s) => { map[s.id] = s.name; });
    return map;
  }, [sites]);

  const transportLabelById = useMemo(() => {
    const map: Record<number, string> = {};
    transportOptions.forEach((t) => {
      map[t.id] = `${t.name} — ${t.number_plate}`;
    });
    return map;
  }, [transportOptions]);

  const totalDeliveries = tasks.length;
  const inTransitCount = useMemo(
    () => tasks.filter((t) => t.status === DriverTaskStatus.IN_PROGRESS).length,
    [tasks],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !q ||
        (t.title ?? '').toLowerCase().includes(q) ||
        (t.items ?? []).some((i) => i.material_name?.toLowerCase().includes(q)) ||
        (t.tool_items ?? []).some((i) => i.tool_name?.toLowerCase().includes(q));
      const matchesDate =
        (!dateRange.start || t.created_at >= dateRange.start) &&
        (!dateRange.end || t.created_at <= dateRange.end);
      return matchesSearch && matchesDate;
    });
  }, [tasks, search, dateRange]);

  const applyDateFilter = useCallback((start: string, end: string) => {
    setDateRange({ start: start || undefined, end: end || undefined });
  }, []);
  const clearDateFilter = useCallback(() => setDateRange({}), []);

  const openInitiateModal = () => setShowInitiateModal(true);
  const closeInitiateModal = () => setShowInitiateModal(false);

  const initiateDelivery = useCallback(async (form: InitiateDeliveryForm) => {
    const payload: CreateDriverTaskPayload = {
      task_type: form.taskType,
      transport_id: form.transportId ? Number(form.transportId) : null,
      notes: form.notes || null,
      title: form.title || null,
      destination_site_id: form.siteId ? Number(form.siteId) : null,
      items: form.items
        .filter((i) => i.materialId && i.quantity)
        .map((i) => ({ material_id: Number(i.materialId), planned_quantity: Number(i.quantity) })),
      tool_items: form.toolItems
        .filter((i) => i.toolId && i.quantity)
        .map((i) => ({ tool_id: Number(i.toolId), planned_quantity: Number(i.quantity) })),
    };

    if (form.taskType === DriverTaskType.TRANSFER) {
      payload.material_transfer_id = form.materialTransferId ? Number(form.materialTransferId) : null;
    }

    try {
      await driverTasksService.create(payload);
      closeInitiateModal();
      loadTasks();
    } catch (err) {
      console.error('[useInternalDeliveries] initiateDelivery failed:', err);
      throw err;
    }
  }, [loadTasks]);

  const hasFilter = !!(search || statusFilter || dateRange.start || dateRange.end);

  return {
    deliveries: filtered,
    totalDeliveries,
    inTransitCount,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom: dateRange.start ?? '',
    dateTo: dateRange.end ?? '',
    appliedLabel: dateRange.start && dateRange.end
      ? `${dateRange.start} → ${dateRange.end}`
      : (dateRange.start || dateRange.end || ''),
    applyDateFilter, clearDateFilter, hasFilter,
    showInitiateModal, openInitiateModal, closeInitiateModal, initiateDelivery,
    siteNameById, transportLabelById,
    sites, transportOptions, transferOptions,
    materialsBySite, toolsBySite, loadMaterialsForSite, loadToolsForSite,
  };
}