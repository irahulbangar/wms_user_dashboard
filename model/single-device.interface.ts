export interface SingleDeviceResponse {
  success: boolean;
  message: string;
  data: SingleDeviceResult;
}

export interface SingleDeviceResult {
  device_id: number;
  organization_id: number;
  in_plant_id: any;
  out_plant_id: any;
  in_department_id: any;
  out_department_id: any;
  in_system_id: number;
  out_system_id: any;
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
  device_family: string;
  device_family_type: string;
  device_type: string;
  in_department_name: any;
  out_department_name: any;
  department_name: string;
  plant_name: string;
  in_plant_name: any;
  out_plant_name: any;
  in_system_name: string;
  out_system_name: any;
  system_name: string;
  plant_longitude: string;
  plant_latitude: string;
  plant_address: string;
  in_plant_latitude: any;
  out_plant_longitude: any;
  in_plant_longitude: any;
  out_plant_latitude: any;
  in_plant_address: any;
  out_plant_address: any;
  report_type_name: string;
  device_reporting: DeviceReporting;
}

export interface LastRecord {
  avg: number;
  max: number;
  min: number;
  flow: number;
  total: number;
  time: string;
  last_level: number;
  first_level: number;
  min_level: number;
  max_level: number;
  KWh: string;
  IMEI: string;
  KVAh: string;
  Time: string;
  date: string;
  flowrate: string;
  Current_b: string;
  Current_r: string;
  Current_y: string;
  Fault_Bit: string;
  Frequency: string;
  Pressure1: string;
  Pressure2: string;
  totalizer: string;
  voltage_b: string;
  voltage_r: string;
  voltage_y: string;
  pumpstatus: string;
  String_Type: string;
  Active_Power: string;
  BatteryLevel: string;
  Temperature1: string;
  Temperature2: string;
  power_factor: string;
  Apparent_Power: string;
  Reactive_Power: string;
  SignalStrength: string;
  Motor_Running_Mode: string;
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
  param_1: Param1;
  param_2: Param2;
  param_3: Param3;
  param_4: Param4;
  param_5: Param5;
  param_6: Param6;
  msg_time: MsgTime;
  water_column: WaterColumn;
  device_params: DeviceParams;
  sensor_voltage: SensorVoltage;
  water_pressure: WaterPressure;
  battery_voltage: BatteryVoltage;
  ambient_pressure: AmbientPressure;
  water_temperature: WaterTemperature;
  ambient_temperature: AmbientTemperature;
  water_column_from_ground: WaterColumnFromGround;
  overWrite: number;
  refValue: number;
  refPercent: number;
}

export interface Param1 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface Param2 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface Param3 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface Param4 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface Param5 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface Param6 {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface MsgTime {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface WaterColumn {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface DeviceParams {
  lat: number;
  lng: number;
  serial: string;
  identifier: string;
  cable_length: number;
  daily_msgs_count: number;
  installation_date: string;
}

export interface SensorVoltage {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface WaterPressure {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface BatteryVoltage {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface AmbientPressure {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface WaterTemperature {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface AmbientTemperature {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface WaterColumnFromGround {
  max: number;
  min: number;
  name: string;
  unit: string;
  enable: boolean;
  ref_val: number;
  set_max: number;
  set_min: number;
  set_limit: number;
  multipliers: number;
  ref_percent: number;
}

export interface DeviceReporting {
  report_name: string;
  report_unit: string;
  report_value: string;
  report_formula: string;
}
