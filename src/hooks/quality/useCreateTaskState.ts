"use client";

import { useState } from "react";
import type { Site } from "@/lib/sites-cache";

export interface CreateTaskFormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

const INITIAL_FORM: CreateTaskFormState = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
};

export function useCreateTaskState() {
  const [form, setForm] = useState<CreateTaskFormState>(INITIAL_FORM);
  const [sites, setSitesState] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    form, setForm,
    sites, setSitesState,
    selectedSite, setSelectedSite,
    siteDropdownOpen, setSiteDropdownOpen,
    loadingSites, setLoadingSites,
    submitting, setSubmitting,
    error, setError,
  };
}

export type CreateTaskState = ReturnType<typeof useCreateTaskState>;