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