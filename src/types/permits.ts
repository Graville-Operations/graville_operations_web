import { PermitStatus } from '@/types/enums/permit-status';
import { ApprovalStatus } from '@/types/enums/approval-status';

export { PermitStatus, ApprovalStatus };
export const STATUS_TABS = ["All", "Draft", "Pending", "In Review", "Approved", "Rejected"] as const;

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

export interface PermitApprovalDTO {
  id: number;
  permit_id?: number;
  approver_id?: number;
  approver?: string;
  step_order?: number;
  status?: string;
  comment?: string | null;
  actioned_at?: string | null;
  created_at?: string;
}

export interface PermitListItem {
  id:           number;
  title:        string;
  status:       PermitStatus;
  current_step: number;
  site:         string;
  category_id:  number;
  categoryName: string;
  updated_at:   string | null;
}

export interface PermitListItemDTO {
  id: number;
  title?: string;
  status?: string;
  current_step?: number;
  site?: string;
  category_id?: number;
  categoryName?: string;
  updated_at?: string;
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

export interface PermitDetailDTO {
  id: number;
  title?: string;
  description?: string | null;
  status?: string;
  currentStep?: number;
  siteId?: number;
  siteName?: string;
  categoryId?: number;
  permitCategory?: string;
  requested_by?: number | null;
  requester?: string;
  created_at?: string;
  updated_at?: string | null;
  approvals?: PermitApprovalDTO[];
}

export interface PermitCategory {
  id:          number;
  name:        string;
  description: string | null;
  is_active:   boolean;
}

export interface PermitCategoryDTO {
  id: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  is_active?: boolean;
}
export type PendingApprovalItem = PermitApproval;

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
  [PermitStatus.DRAFT]:     { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" },
  [PermitStatus.PENDING]:   { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  [PermitStatus.IN_REVIEW]: { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  [PermitStatus.APPROVED]:  { bg: "rgba(51,144,124,0.15)",  color: "#33907c" },
  [PermitStatus.REJECTED]:  { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};

export const APPROVAL_STYLES: Record<string, { bg: string; color: string }> = {
  [ApprovalStatus.PENDING]:  { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  [ApprovalStatus.APPROVED]: { bg: "rgba(51,144,124,0.15)",  color: "#33907c" },
  [ApprovalStatus.REJECTED]: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};