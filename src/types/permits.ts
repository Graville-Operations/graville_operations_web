export type PermitStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Revision Requested";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface PermitApproval {
  id: number;
  permit_id: number;
  approver_id: number;
  step_order: number;
  status: ApprovalStatus;
  comment: string | null;
  actioned_at: string | null;
  created_at: string;
}

export interface Permit {
  id: number;
  title: string;
  description: string;
  status: PermitStatus;
  currentStep: number;
  siteId: number;
  siteName: string;
  categoryId: number;
  permitCategory: string;
  requested_by: number;
  requester: string;
  created_at: string;
  updated_at: string;
  approvals: PermitApproval[];
}

export interface CreatePermitPayload {
  title: string;
  description: string;
  siteId: number;
  categoryId: number;
}

export interface TakeActionPayload {
  action: "approve" | "reject" | "request_revision";
  comment?: string;
}

export interface PaginatedPermits {
  data: Permit[];
  total: number;
  skip: number;
  limit: number;
}