export interface SingleDeviceResponse {
  success: boolean;
  message: string;
  data: SingleDeviceResult;
}

export interface SingleDeviceResult {
  device_id: number
  organization_id: number
  in_plant_id: any
  out_plant_id: any
  in_department_id: any
  out_department_id: any
  in_system_id: number
  out_system_id: any
  device_family_id: number
  device_type_id: number
  hwid: string
  device_name: string
  device_status: string
  last_record: LastRecord
  last_record_time: string
  params: Params
  visibility: string
  is_deleted: boolean
  organization_connection: string
  device_flow_direction: string
  report_type_id: number
  unit: string
  created_at: string
  updated_at: string
  plant_id: number
  department_id: number
  system_id: number
  device_family: string
  device_family_type: string
  device_type: string
  in_department_name: any
  out_department_name: any
  department_name: string
  plant_name: string
  in_plant_name: any
  out_plant_name: any
  in_system_name: string
  out_system_name: any
  system_name: string
  plant_longitude: string
  plant_latitude: string
  plant_address: string
  in_plant_latitude: any
  out_plant_longitude: any
  in_plant_longitude: any
  out_plant_latitude: any
  in_plant_address: any
  out_plant_address: any
  report_type_name: string
}

export interface LastRecord {
  avg: number
  max: number
  min: number
  flow: number
  time: string
  last_level: number
  first_level: number
  min_level: number
  max_level: number
  KWh: string
  IMEI: string
  KVAh: string
  Time: string
  date: string
  flowrate: string
  Current_b: string
  Current_r: string
  Current_y: string
  Fault_Bit: string
  Frequency: string
  totalizer: string
  voltage_b: number
  voltage_r: number
  voltage_y: number
  pumpstatus: string
  String_Type: string
  Active_Power: string
  BatteryLevel: string
  power_factor: string
  Apparent_Power: string
  Reactive_Power: string
  SignalStrength: string
  Motor_Running_Mode: string
}

export interface Params {
  height: number;
  shifter: number;
  multiplier: number;
  sensorPostion: number;
  storageCapacity: number;
  maxThreshold: number;
  inputFor: number;
  outputFor: number;
}
