export interface PlantAlertResponse {
  success: boolean;
  message: string;
  data: PlantAlertResult[];
  total: number;
}

export interface PlantAlertResult {
  date: string;
  device_id: number;
  system_id: number;
  plant_id: number;
  department_id: number;
  alert_entity: string;
  alert_title: string;
  alert_message: string;
  alert_priority: string;
  alert_status: string;
  is_internal: boolean;
  alert_data: AlertData;
  created_at: string;
  updated_at: string;
}

export interface AlertData {}
