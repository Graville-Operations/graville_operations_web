export interface PermitCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export type PermitStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "revision_requested";

export interface Permit {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  category?: PermitCategory;
  status: PermitStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  submitted_at?: string;
  notes?: string;
}

export interface CreatePermitPayload {
  title: string;
  description?: string;
  category_id: string;
  notes?: string;
}

export interface TakeActionPayload {
  action: "approve" | "reject" | "request_revision";
  comment?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  per_page?: number;
}