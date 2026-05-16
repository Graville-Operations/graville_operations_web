export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type SiteStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export interface Site {
  id: number;
  name: string;
  location: string | null;
  project_status: ProjectStatus;
  site_status: SiteStatus;
  created_at: string;
  updated_at: string | null;
  completion_date: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: number;
  updated_by: number | null;
  tags: string[];
  description: string | null;
  tender_name: string | null;
  inquiring_entity: string | null;
  field_operator_id: number | null;
}

export interface CreateSitePayload {
  name: string;
  location?: string;
  project_status: ProjectStatus;
  site_status?: SiteStatus;
  completion_date?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  description?: string;
  tender_name?: string;
  inquiring_entity?: string;
  field_operator_id?: number;
}