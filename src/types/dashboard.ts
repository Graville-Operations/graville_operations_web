export interface DashboardMetrics {
  sites: number;
  workers: number;
  tasks: {
    totalTasks: number;
    completedTasks: number;
    taskCompletionPercentage: number;
  };
  expenditure: {
    supplier: number;
    subcontractor: number;
    total: number;
  };
  totalPermits: number;
  attendancePercentageToday: number;
  projectStatus: {
    planning: number;
    inProgress: number;
    onHold: number;
    completed: number;
    cancelled: number;
  };
  permits: {
    pending: number;
    approved: number;
    rejected: number;
  };
  materials: {
    totalMaterials: number;
    totalTools: number;
    toolsOnHire: number;
    toolsInRepair: number;
    sitesWithLowStocks: number;
  };
  orders: {
    totalOrders: number;
    orderBreakdown: Array<{
      siteName: string;
      materials: Array<{
        materialName: string;
        quantity: string;
      }>;
    }>;
  };
}

export type DashboardMetricsDTO = Partial<DashboardMetrics>;

export interface AttendanceDay {
  date: string;
  present_count: number;
}

export interface Bar {
  label: string;
  fullLabel: string;
  date: string;
  dateDisplay: string;
  present: number;
}

export type AttendanceTab = 'Today' | 'Week' | 'Month' | 'Custom';