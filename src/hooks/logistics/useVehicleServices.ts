'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { vehicleServicesService } from '@/lib/api/vehicle-services';
import { modesOfTransportService } from '@/lib/api/transport-service';
import {
  VehicleService,
  VehicleServiceType,
  VehicleServiceStatus,
  CreateServiceRequestPayload,
  ServiceRequestForm,
} from '@/types/vehicle-service';
import { ModeOfTransport } from '@/types/transport';

export function useVehicleServices() {
  const [services, setServices] = useState<VehicleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [transportOptions, setTransportOptions] = useState<ModeOfTransport[]>([]);

  const [search, setSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<VehicleServiceType | null>(null);
  const [statusFilter, setStatusFilter] = useState<VehicleServiceStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const loadServices = useCallback(() => {
    setLoading(true);
    vehicleServicesService
      .listAll({ status: statusFilter ?? undefined, skip: 0, limit: 100 })
      .then(({ items }) => setServices(Array.isArray(items) ? items : []))
      .catch((err) => {
        console.error('[useVehicleServices] loadServices failed:', err);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { loadServices(); }, [loadServices]);

  useEffect(() => {
    modesOfTransportService.list().then((r) => setTransportOptions(Array.isArray(r) ? r : [])).catch((err) => {
      console.error('[useVehicleServices] load transport options failed:', err);
    });
  }, []);

  const applyDateFilter = useCallback((start: string, end: string) => {
    setDateRange({ start: start || undefined, end: end || undefined });
  }, []);
  const clearDateFilter = useCallback(() => setDateRange({}), []);

  const appliedLabel = dateRange.start && dateRange.end
    ? `${dateRange.start} → ${dateRange.end}`
    : (dateRange.start || dateRange.end || '');

  // NOTE: the backend's `status` filter is already applied server-side
  // above (see loadServices). Search, service-type, and date are
  // applied client-side against whatever page of results came back.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchesSearch = !q || s.vehicle.toLowerCase().includes(q) || s.number_plate.toLowerCase().includes(q);
      const matchesType = !serviceTypeFilter || s.requested_service_type === serviceTypeFilter;
      const matchesDate =
        (!dateRange.start || s.date >= dateRange.start) &&
        (!dateRange.end || s.date <= dateRange.end);
      return matchesSearch && matchesType && matchesDate;
    });
  }, [services, search, serviceTypeFilter, dateRange]);

  const hasFilter = !!(search || serviceTypeFilter || statusFilter || dateRange.start || dateRange.end);

  const createServiceRequest = useCallback(async (form: ServiceRequestForm) => {
    const payload: CreateServiceRequestPayload = {
      transport_id: Number(form.transportId),
      requested_service_type: form.requestedServiceType,
      mileage: Number(form.mileage),
      requested_cost: Number(form.requestedCost),
    };
    try {
      await vehicleServicesService.create(payload);
      loadServices();
    } catch (err) {
      console.error('[useVehicleServices] createServiceRequest failed:', err);
      throw err;
    }
  }, [loadServices]);

  return {
    services: filtered,
    loading,
    search, setSearch,
    serviceTypeFilter, setServiceTypeFilter,
    statusFilter, setStatusFilter,
    dateFrom: dateRange.start ?? '',
    dateTo: dateRange.end ?? '',
    appliedLabel, applyDateFilter, clearDateFilter,
    hasFilter,
    transportOptions,
    createServiceRequest,
  };
}