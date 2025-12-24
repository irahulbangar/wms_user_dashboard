export interface DevicesResponse {
  success: boolean;
  message: string;
  data: DevicesResult[];
}

export interface DevicesResult {
  device_id: number;
  organization_id: number;
  in_plant_id: number;
  out_plant_id: number;
  in_department_id: number;
  out_department_id: number;
  in_system_id: number;
  out_system_id: number;
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
  device_reporting: DeviceReporting;
  manual_mode: boolean;
  device_family: string;
  device_family_type: string;
  device_type: string;
  in_department_name: string;
  out_department_name: string;
  department_name: string;
  organization_name: string;
  in_plant_name: string;
  out_plant_name: string;
  plant_name: string;
  introduction: string;
  governance: string;
  logo: string;
  in_plant_longitude: string;
  out_plant_longitude: string;
  in_plant_latitude: string;
  out_plant_latitude: string;
  in_system_name: string;
  out_system_name: string;
  system_name: string;
  report_type: string;
  report_type_name: string;
}

export interface DeviceReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
  report_value: number | null;
}

export interface LastRecord {
  avg?: number;
  max?: number;
  min?: number;
  flow?: number;
  time?: string;
  max_level?: number;
  min_level?: number;
  last_level?: string;
  first_level?: string;
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
  totalizer?: string;
  voltage_b?: number;
  voltage_r?: number;
  voltage_y?: number;
  pumpstatus?: string;
  String_Type?: string;
  Active_Power?: string;
  BatteryLevel?: string;
  power_factor?: string;
  Apparent_Power?: string;
  Reactive_Power?: string;
  SignalStrength?: string;
  Motor_Running_Mode?: string;
  max_mm?: number;
  min_mm?: number;
  last_mm?: number;
  first_mm?: number;
  total: number;
}

export interface Params {
  shifter: any;
  multiplier: any;
  maxThreshold: string;
  lowerLimit: string;
  upperLimit: string;
  height?: number;
  sensorPostion?: number;
  storageCapacity?: number;
  A?: number;
  B?: number;
  sg?: number;
  hmax?: number;
  hmin?: number;
  crossSectionArea?: number;
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
}

export interface Node {
  id: string;
  data: Data;
  type: string;
  style?: Style;
  width: number;
  height: number;
  dragging?: boolean;
  position: Position;
  selected?: boolean;
  parentId?: string;
  sourcePosition?: string;
  targetPosition?: string;
  positionAbsolute?: PositionAbsolute;
}

export interface Data {
  type: string;
  unit: string;
  label: string;
  height?: number;
  capacity?: number;
  isActive?: boolean;
  direction?: string;
}

export interface Style {
  width: number;
  border: string;
  height: number;
  borderRadius: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface PositionAbsolute {
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  type: string;
  style: Style2;
  source: string;
  target: string;
  animated: boolean;
}

export interface Style2 {
  stroke: string;
  strokeWidth: number;
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
