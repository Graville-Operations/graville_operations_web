"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiUser } from "@/types";
import { fetchUsers } from "@/lib/api/users";
import {
  fetchCategories,
  createPermit,
  submitPermit,
  resolveErrorMessage,
} from "@/lib/api/permits";
import { PermitCategory, CreatePermitPayload } from "@/types/permits";
import { SelectedApprover, toggleApproverIn } from "@/lib/utils/approvers";

interface CreatedPermit {
  id: number;
  title: string;
  description: string;
  status: string;
  permitCategory: string;
  currentStep: number;
}

export function useCreatePermit() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApprovers, setSelectedApprovers] = useState<SelectedApprover[]>([]);
  const [createdPermit, setCreatedPermit] = useState<CreatedPermit | null>(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });

  useEffect(() => {
    (async () => {
      try {
        const [cats, userList] = await Promise.all([fetchCategories(), fetchUsers()]);
        setCategories(cats);
        setUsers(userList);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggleApprover = (user: ApiUser) => {
    setSelectedApprovers((prev) => toggleApproverIn(prev, user));
  };

  const handleCreate = async () => {
    setError(null);
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.categoryId) return setError("Please select a category.");
    if (selectedApprovers.length === 0) return setError("Please select at least one approver.");
    try {
      setCreating(true);
      const payload: CreatePermitPayload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: Number(form.categoryId),
        approvers: selectedApprovers.map((a) => ({ approver_id: a.userId, step_order: a.stepOrder })),
      };
      const data = await createPermit(payload);
      setCreatedPermit(data);
      setStep("confirm");
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to create permit."));
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (!createdPermit) return;
    try {
      setSubmitting(true);
      await submitPermit(createdPermit.id);
      setSubmitted(true);
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to submit."));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("form");
    setSubmitted(false);
    setCreatedPermit(null);
    setForm({ title: "", description: "", categoryId: "" });
    setSelectedApprovers([]);
    setError(null);
  };

  const goBack = () => (step === "confirm" ? setStep("form") : router.back());
  const viewMyPermits = () => router.push("/permits/my-permits");

  const selectedCategory = categories.find((c) => c.id === Number(form.categoryId));

  return {
    step, setStep,
    categories, users,
    creating, submitting, submitted,
    error, form, setForm,
    selectedApprovers, toggleApprover,
    createdPermit, selectedCategory,
    handleCreate, handleSubmit, reset,
    goBack, viewMyPermits,
  };
}