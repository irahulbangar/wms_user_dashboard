export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: DepartmentResult[];
}

export interface DepartmentResult {
  department_id: number;
  department_name: string;
  department_info: string;
  organization_id: number;
  plant_id: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  plant_name: string;
  organization_name: string;
}
