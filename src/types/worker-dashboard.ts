export enum SkillType {
  SKILLED = 'SKILLED',
  UNSKILLED = 'UNSKILLED',
}

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