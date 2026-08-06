export type PayrollPeriod = 'today' | 'week' | 'month';

export interface SiteLabourBreakdown {
  siteId: number;
  siteName: string;
  labourAmount: number;
}

export interface PayrollSummary {
  totalLabour: number;
  breakdown: SiteLabourBreakdown[];
}