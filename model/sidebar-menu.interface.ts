export interface SidebarMenuResponse {
  success: boolean;
  message: string;
  data: SidebarMenuResult[];
}

export interface SidebarMenuResult {
  plant_name: string;
  plant_id: number;
  address: string;
  department_name: string;
  department_id: number;
  system_name: string;
  system_id: number;
  organization_name: string;
  organization_id: number;
  subdomain: string;
  show_plant: string;
  show_department: string;
  show_system: string;
  show_device: string;
  show_water_report: string;
  show_plant_layout: string;
  show_notification: string;
}
