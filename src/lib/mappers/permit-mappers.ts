import { PermitStatus } from '@/types/enums/permit-status';
import { ApprovalStatus } from '@/types/enums/approval-status';
import type {
  PermitListItem,
  PermitListItemDTO,
  PermitDetail,
  PermitDetailDTO,
  PermitApproval,
  PermitApprovalDTO,
  PermitCategory,
  PermitCategoryDTO,
  PendingApprovalItem,
} from '@/types/permits';

export function normalisePermitListItem(dto: PermitListItemDTO): PermitListItem {
  return {
    id: dto.id,
    title: dto.title ?? '',
    status: (dto.status as PermitStatus) ?? PermitStatus.DRAFT,
    current_step: dto.current_step ?? 1,
    site: dto.site ?? '',
    category_id: dto.category_id ?? 0,
    categoryName: dto.categoryName ?? '',
    updated_at: dto.updated_at ?? null,
  };
}

export function normalisePermitListItems(dtos: PermitListItemDTO[]): PermitListItem[] {
  return dtos.map(normalisePermitListItem);
}

export function normalisePermitApproval(dto: PermitApprovalDTO): PermitApproval {
  return {
    id: dto.id,
    permit_id: dto.permit_id ?? 0,
    approver_id: dto.approver_id ?? 0,
    approver: dto.approver ?? '',
    step_order: dto.step_order ?? 0,
    status: (dto.status as ApprovalStatus) ?? ApprovalStatus.PENDING,
    comment: dto.comment ?? null,
    actioned_at: dto.actioned_at ?? null,
    created_at: dto.created_at ?? '',
  };
}

export function normalisePendingApprovals(dtos: PermitApprovalDTO[]): PendingApprovalItem[] {
  return dtos.map(normalisePermitApproval);
}

export function normalisePermitDetail(dto: PermitDetailDTO): PermitDetail {
  return {
    id: dto.id,
    title: dto.title ?? '',
    description: dto.description ?? '',
    status: (dto.status as PermitStatus) ?? PermitStatus.DRAFT,
    currentStep: dto.currentStep ?? 1,
    siteId: dto.siteId ?? 0,
    siteName: dto.siteName ?? '',
    categoryId: dto.categoryId ?? 0,
    permitCategory: dto.permitCategory ?? '',
    requested_by: dto.requested_by ?? 0,
    requester: dto.requester ?? '',
    created_at: dto.created_at ?? '',
    updated_at: dto.updated_at ?? '',
    approvals: (dto.approvals ?? []).map(normalisePermitApproval),
  };
}

export function normalisePermitCategory(dto: PermitCategoryDTO): PermitCategory {
  return {
    id: dto.id,
    name: dto.name ?? '',
    description: dto.description ?? null,
    is_active: dto.isActive ?? dto.is_active ?? true,
  };
}

export function normalisePermitCategories(dtos: PermitCategoryDTO[]): PermitCategory[] {
  return dtos.map(normalisePermitCategory);
}