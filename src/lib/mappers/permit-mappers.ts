import { PermitStatus } from '@/types/enums/permit-status';
import { ApprovalStatus } from '@/types/enums/approval-status';
import type {
  PermitListItem,
  PermitDetail,
  PermitApproval,
  PermitCategory,
  PendingApprovalItem,
} from '@/types/permits';

export interface RawPermitListItem {
  id: number;
  title?: string;
  status?: string;
  current_step?: number;
  site?: string;
  category_id?: number;
  categoryName?: string;
  updated_at?: string;
}

export function normalisePermitListItem(raw: RawPermitListItem): PermitListItem {
  return {
    id: raw.id,
    title: raw.title ?? '',
    status: (raw.status as PermitStatus) ?? PermitStatus.DRAFT,
    current_step: raw.current_step ?? 1,
    site: raw.site ?? '',
    category_id: raw.category_id ?? 0,
    categoryName: raw.categoryName ?? '',
    updated_at: raw.updated_at ?? null,
  };
}

export function normalisePermitListItems(raw: RawPermitListItem[]): PermitListItem[] {
  return raw.map(normalisePermitListItem);
}

export interface RawPermitApproval {
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

export function normalisePermitApproval(raw: RawPermitApproval): PermitApproval {
  return {
    id: raw.id,
    permit_id: raw.permit_id ?? 0,
    approver_id: raw.approver_id ?? 0,
    approver: raw.approver ?? '',
    step_order: raw.step_order ?? 0,
    status: (raw.status as ApprovalStatus) ?? ApprovalStatus.PENDING,
    comment: raw.comment ?? null,
    actioned_at: raw.actioned_at ?? null,
    created_at: raw.created_at ?? '',
  };
}

export function normalisePendingApprovals(raw: RawPermitApproval[]): PendingApprovalItem[] {
  return raw.map(normalisePermitApproval);
}

export interface RawPermitDetail {
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
  approvals?: RawPermitApproval[];
}

export function normalisePermitDetail(raw: RawPermitDetail): PermitDetail {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    status: (raw.status as PermitStatus) ?? PermitStatus.DRAFT,
    currentStep: raw.currentStep ?? 1,
    siteId: raw.siteId ?? 0,
    siteName: raw.siteName ?? '',
    categoryId: raw.categoryId ?? 0,
    permitCategory: raw.permitCategory ?? '',
    requested_by: raw.requested_by ?? 0,
    requester: raw.requester ?? '',
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
    approvals: (raw.approvals ?? []).map(normalisePermitApproval),
  };
}

export interface RawPermitCategory {
  id: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  is_active?: boolean;
}

export function normalisePermitCategory(raw: RawPermitCategory): PermitCategory {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? null,
    is_active: raw.isActive ?? raw.is_active ?? true,
  };
}

export function normalisePermitCategories(raw: RawPermitCategory[]): PermitCategory[] {
  return raw.map(normalisePermitCategory);
}