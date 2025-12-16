export interface ReportResponse {
  success: boolean;
  message: string;
  data: ReportResult;
}

export interface ReportResult {
  allDevices: AllDevice[];
  report: PlantReportData;
  logs: Logs;
  systems: SystemsResult;
  departments: DepartmentsResult;
}

export interface AllDevice {
  device_id: number;
  organization_id: number;
  in_plant_id?: number;
  out_plant_id?: number;
  in_department_id?: number;
  out_department_id?: number;
  in_system_id?: number;
  out_system_id?: number;
  device_family_id: number;
  device_type_id: number;
  hwid: string;
  device_name: string;
  device_status: string;
  last_record: LastRecord;
  last_record_time: string;
  params: Params;
  visibility: string;
  is_deleted: boolean;
  organization_connection: string;
  device_flow_direction: string;
  report_type_id: number;
  unit: string;
  created_at: string;
  updated_at: string;
  plant_id: number;
  department_id: number;
  system_id: number;
  device_reporting?: DeviceReporting;
  manual_mode: boolean;
  device_family: string;
  device_family_type: string;
  device_type: string;
  in_department_name?: string;
  out_department_name?: string;
  department_name: string;
  organization_name: string;
  introduction: string;
  governance: string;
  logo: string;
  in_plant_name?: string;
  out_plant_name?: string;
  plant_name: string;
  plant_longitude: string;
  plant_latitude: string;
  plant_address: string;
  in_system_name?: string;
  out_system_name?: string;
  system_name: string;
  in_plant_latitude?: string;
  out_plant_longitude?: string;
  in_plant_longitude?: string;
  out_plant_latitude?: string;
  in_plant_address?: string;
  out_plant_address?: string;
  report_type_name: string;
}

export interface LastRecord {
  KWh?: string;
  IMEI?: string;
  KVAh?: string;
  Time?: string;
  date?: string;
  flowrate?: string;
  Current_b?: string;
  Current_r?: string;
  Current_y?: string;
  Fault_Bit?: string;
  Frequency?: string;
  Pressure1?: string;
  Pressure2?: string;
  totalizer?: string;
  voltage_b?: string;
  voltage_r?: string;
  voltage_y?: string;
  pumpstatus?: string;
  String_Type?: string;
  Active_Power?: string;
  BatteryLevel?: string;
  Temperature1?: string;
  Temperature2?: string;
  power_factor?: string;
  Apparent_Power?: string;
  Reactive_Power?: string;
  SignalStrength?: string;
  Motor_Running_Mode?: string;
  time?: string;
  max_level?: number;
  min_level?: number;
  last_level: any;
  first_level: any;
  avg?: number;
  max?: number;
  min?: number;
  flow?: number;
  total?: number;
}

export interface Params {
  A: any;
  B: any;
  C?: string;
  D?: string;
  lowerLimit?: string;
  multiplier: any;
  upperLimit?: string;
  maxThreshold: string;
  shifter?: string;
  height?: number;
  sensorPostion?: number;
  storageCapacity?: number;
  crossSectionArea?: number;
  sg?: number;
  hmax?: number;
  hmin?: number;
}

export interface DeviceReporting {
  report_name: string;
  report_unit: string;
  report_value?: string;
  report_formula: string;
  neutrality_formula?: string;
}

export interface PlantReportData {
  [key: string]: ReportItem;
}

export interface ReportItem {
  Flow: number;
  Flow_in: number;
  Flow_out: number;
  Percolation: number;
  Evaporation: number;
  Consumption: number;
  Wastage: number;
  Regeneration: number;
  "Re-use": number;
  Rainfall: number;
  "Neutrality-Index": number;
}

export interface Logs {
  [key: string]: LogItem;
}

export interface LogItem {
  [key: string]: LogItemData;
}

export interface LogItemData {
  device_id: number;
  group_of: string;
  interval_start: string;
  interval_end: string;
  avg: string;
  min: string;
  max: string;
  flow: string;
  type: string;
  system_connection: SystemConnection;
  department_connection: DepartmentConnection;
  plant_connection: PlantConnection;
  report_type_name: string;
}

export interface SystemConnection {
  system_id: number;
  in_system_id: number;
  out_system_id: any;
}

export interface DepartmentConnection {
  department_id: number;
  in_department_id: number;
  out_department_id: any;
}

export interface PlantConnection {
  plant_id: number;
  in_plant_id: number;
  out_plant_id: any;
}

export interface SystemsResult {
  [key: string]: SystemItem;
}

export interface SystemItem {
  [key: string]: SystemItemData;
}

export interface SystemItemData {
  [key: string]: SystemItemDataValue;
}

export interface SystemItemDataValue {
  Flow: number;
  Flow_in: number;
  Flow_out: number;
  Percolation: number;
  Evaporation: number;
  Consumption: number;
  Wastage: number;
  Regeneration: number;
  "Re-use": number;
  Rainfall: number;
}

export interface DepartmentsResult {
  [key: string]: DepartmentItemData;
}

export interface DepartmentItemData {
  [key: string]: DepartmentItemDataValue;
}

export interface DepartmentItemDataValue {
  Flow: number;
  Flow_in: number;
  Flow_out: number;
  Percolation: number;
  Evaporation: number;
  Consumption: number;
  Wastage: number;
  Regeneration: number;
  "Re-use": number;
  Rainfall: number;
}
