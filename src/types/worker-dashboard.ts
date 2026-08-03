import { SkillType } from '@/types/enums/skill-type';

export { SkillType };

export interface WorkerType {
  id: number;
  name: string;
  amount: number;
  skill: SkillType | string;
}

export interface WorkerSkillSummary {
  id: number;
  name: string;
  amount: number;
}

export interface WorkerBrief {
  id: number;
  first_name: string;
  last_name: string;
  skill: WorkerSkillSummary;
  status: string;
}