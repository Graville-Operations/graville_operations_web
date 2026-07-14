"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSites as setSitesCache, getAllSites, sitesLoaded } from "@/lib/sites-cache";
import { fetchSites, createTask, extractErrorMessage } from "@/lib/api/tasks-service";
import type { CreateTaskState } from "./useCreateTaskState";

export function useCreateTaskLogic(state: CreateTaskState) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSiteId = searchParams.get("site_id");

  const {
    form,
    setForm,
    setSitesState,
    selectedSite,
    setSelectedSite,
    setSiteDropdownOpen,
    setLoadingSites,
    setSubmitting,
    setError,
  } = state;

  // ── Load sites from the shared cache, else fetch once ───────────────
  useEffect(() => {
    if (sitesLoaded()) {
      const list = getAllSites();
      setSitesState(list);
      if (preSelectedSiteId) {
        const found = list.find((s) => s.id === Number(preSelectedSiteId));
        if (found) setSelectedSite(found);
      }
      setLoadingSites(false);
      return;
    }

    fetchSites()
      .then((list) => {
        setSitesCache(list);
        setSitesState(list);
        if (preSelectedSiteId) {
          const found = list.find((s) => s.id === Number(preSelectedSiteId));
          if (found) setSelectedSite(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSites(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedSiteId]);

  const setField = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [setForm]
  );

  const selectSite = useCallback(
    (site: NonNullable<typeof selectedSite>) => {
      setSelectedSite(site);
      setSiteDropdownOpen(false);
    },
    [setSelectedSite, setSiteDropdownOpen]
  );

  const toggleSiteDropdown = useCallback(() => {
    setSiteDropdownOpen((open) => !open);
  }, [setSiteDropdownOpen]);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setError("Task name is required"); return; }
    if (!selectedSite)     { setError("Please select a site"); return; }
    if (!form.start_date)  { setError("Start date is required"); return; }
    if (!form.end_date)    { setError("End date is required"); return; }

    setSubmitting(true);
    setError(null);
    try {
      await createTask({
        name: form.name.trim(),
        description: form.description.trim(),
        site_id: selectedSite.id,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      router.back();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to create task"));
      setSubmitting(false);
    }
  }, [form, selectedSite, router, setSubmitting, setError]);

  return { setField, selectSite, toggleSiteDropdown, handleSubmit };
}