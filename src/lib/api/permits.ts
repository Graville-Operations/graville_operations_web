import {
  Permit,
  PermitCategory,
  CreatePermitPayload,
  TakeActionPayload,
} from "@/types/permits";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Categories ───────────────────────────────────────────────
export async function createPermitCategory(
  name: string,
  description?: string
): Promise<PermitCategory> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/category/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse<PermitCategory>(res);
}

export async function updatePermitCategory(
  categoryId: string,
  data: Partial<{ name: string; description: string }>
): Promise<PermitCategory> {
  const res = await fetch(
    `${BASE_URL}/api/v1/permits/category/${categoryId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse<PermitCategory>(res);
}

export async function listPermitCategories(): Promise<PermitCategory[]> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/categories`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<any>(res);
  // support both array and wrapped { data: [] } responses
  return Array.isArray(data) ? data : data.data ?? [];
}

// ─── Permits ──────────────────────────────────────────────────
export async function createPermit(
  payload: CreatePermitPayload
): Promise<Permit> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Permit>(res);
}

export async function submitPermit(permitId: string): Promise<Permit> {
  const res = await fetch(
    `${BASE_URL}/api/v1/permits/submit/${permitId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<Permit>(res);
}

export async function takeAction(
  permitId: string,
  payload: TakeActionPayload
): Promise<Permit> {
  const res = await fetch(
    `${BASE_URL}/api/v1/permits/take-action/${permitId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );
  return handleResponse<Permit>(res);
}

export async function getPermitById(permitId: string): Promise<Permit> {
  const res = await fetch(
    `${BASE_URL}/api/v1/permits/get/${permitId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<Permit>(res);
}

export async function getMyPermits(): Promise<Permit[]> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/my-pemits`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<any>(res);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getAllPermits(): Promise<Permit[]> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/all`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<any>(res);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getPendingPermits(): Promise<Permit[]> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/pending`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<any>(res);
  return Array.isArray(data) ? data : data.data ?? [];
}