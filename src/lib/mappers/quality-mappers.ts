import type { Site, QualitySiteDTO, Task, TaskDTO, SubTask, SubTaskDTO, Worker, WorkerBriefDTO, TaskStatus, SubTaskStatus } from '@/lib/types';
import type { SiteDetailDTO } from '@/types/site';
import type { SiteDetail } from '@/lib/api/quality';

export function normaliseQualitySite(dto: QualitySiteDTO): Site {
  return {
    id: dto.id,
    name: dto.name ?? '',
  };
}

export function normaliseQualitySites(dtos: QualitySiteDTO[]): Site[] {
  return dtos.map(normaliseQualitySite);
}

export function normaliseQualitySiteDetail(dto: SiteDetailDTO): SiteDetail {
  return {
    id: dto.id,
    name: dto.name ?? '',
    location: dto.location ?? null,
    description: dto.description ?? null,
    estimatedValue: dto.estimatedValue ?? 0,
    projectStatus: dto.projectStatus ?? '',
    siteStatus: dto.siteStatus ?? '',
    completionDate: dto.completionDate ?? null,
    tags: dto.tags ?? [],
    tendererName: dto.tendererName ?? null,
    inquiringEntity: dto.inquiringEntity ?? null,
  };
}

export function normaliseWorkerBrief(dto: WorkerBriefDTO): Worker {
  return {
    id: dto.id,
    first_name: dto.first_name ?? '',
    last_name: dto.last_name ?? '',
    skill: dto.skill ?? null,
  };
}

function normaliseTaskStatus(status: string | undefined): TaskStatus {
  const upper = (status ?? '').toUpperCase();
  const valid: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];
  return (valid as string[]).includes(upper) ? (upper as TaskStatus) : 'PENDING';
}

function normaliseSubTaskStatus(status: string | undefined): SubTaskStatus {
  const upper = (status ?? '').toUpperCase();
  const valid: SubTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  return (valid as string[]).includes(upper) ? (upper as SubTaskStatus) : 'PENDING';
}

export function normaliseSubTask(dto: SubTaskDTO): SubTask {
  return {
    id: dto.id,
    name: dto.name ?? '',
    description: dto.description ?? undefined,
    status: normaliseSubTaskStatus(dto.status),
    completion_percentage: dto.completion_percentage ?? 0,
    task_id: dto.task_id ?? 0,
    assigned_workers: (dto.assigned_workers ?? []).map(normaliseWorkerBrief),
  };
}

export function normaliseSubTasks(dtos: SubTaskDTO[]): SubTask[] {
  return dtos.map(normaliseSubTask);
}

export function normaliseTask(dto: TaskDTO): Task {
  return {
    id: dto.id,
    name: dto.name ?? '',
    description: dto.description ?? undefined,
    status: normaliseTaskStatus(dto.status),
    start_date: dto.start_date ?? '',
    end_date: dto.end_date ?? '',
    site_id: dto.site_id ?? 0,
    created_by: dto.created_by ?? null,
    subtasks: dto.subtasks ? normaliseSubTasks(dto.subtasks) : undefined,
  };
}

export function normaliseTasks(dtos: TaskDTO[]): Task[] {
  return dtos.map(normaliseTask);
}