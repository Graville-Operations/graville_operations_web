export type PermitStatus =
  | "Draft"
  | "Pending"
  | "In Review"
  | "Approved"
  | "Rejected";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface PermitApproval {
  id:          number;
  permit_id:   number;
  approver_id: number;
  approver:    string;
  step_order:  number;
  status:      ApprovalStatus;
  comment:     string | null;
  actioned_at: string | null;
  created_at:  string;
}

export interface PermitListItem {
  [x: string]: string | number | null | undefined;
  id:           number;
  title:        string;
  status:       PermitStatus;
  current_step: number;
  site_id:      number;
  category_id:  number;
  categoryName: string;
  created_at:   string;
}

export interface PermitDetail {
  id:             number;
  title:          string;
  description:    string;
  status:         PermitStatus;
  currentStep:    number;
  siteId:         number;
  siteName:       string;
  categoryId:     number;
  permitCategory: string;
  requested_by:   number;
  requester:      string;
  created_at:     string;
  updated_at:     string;
  approvals:      PermitApproval[];
}

export interface PermitCategory {
  id:          number;
  name:        string;
  description: string | null;
  is_active:   boolean;
}

export interface PendingApprovalItem {
  id:          number;
  permit_id:   number;
  approver_id: number;
  approver:    string; 
  step_order:  number;
  status:      ApprovalStatus;
  comment:     string | null;
  actioned_at: string | null;
  created_at:  string;
  updated_at:  string;
}

export interface ApproverStep {
  approver_id: number;
  step_order:  number;
}

export interface CreatePermitPayload {
  title:       string;
  description: string| null;
  category_id: number;
  approvers:   ApproverStep[];
}

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Draft":     { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" },
  "Pending":   { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  "In Review": { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  "Approved":  { bg: "rgba(51,144,124,0.15)",  color: "#33907c" },
  "Rejected":  { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};

export const APPROVAL_STYLES: Record<string, { bg: string; color: string }> = {
  "Pending":  { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  "Approved": { bg: "rgba(51,144,124,0.15)",  color: "#33907c" },
  "Rejected": { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};