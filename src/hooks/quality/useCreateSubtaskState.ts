"use client";

import { useState } from "react";
import type { Worker } from "@/lib/types";

export interface CreateSubtaskFormState {
  name: string;
  description: string;
}

const INITIAL_FORM: CreateSubtaskFormState = { name: "", description: "" };

export function useCreateSubtaskState() {
  const [form, setForm] = useState<CreateSubtaskFormState>(INITIAL_FORM);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    form, setForm,
    workers, setWorkers,
    loadingWorkers, setLoadingWorkers,
    workersError, setWorkersError,
    selectedWorkers, setSelectedWorkers,
    workerSearch, setWorkerSearch,
    submitting, setSubmitting,
    error, setError,
  };
}

export type CreateSubtaskState = ReturnType<typeof useCreateSubtaskState>;