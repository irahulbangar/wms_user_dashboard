export interface DwlrDeviceResponse {
  success: boolean;
  data: DwlrDeviceResultItem[];
  message: string;
}

export interface DwlrDeviceResultItem {
  id: number;
  device_id: number;
  log_time: string;
  time: string;
  date: string;
  water_column: number;
  water_temperature: number;
  water_pressure: number;
  ambient_temperature: number;
  ambient_pressure: number;
  msg_time: string;
  water_column_from_ground: number;
  sensor_voltage: number;
  battery_voltage: number;
  param_1: number;
  param_2: number;
  param_3: number;
  param_4: number;
  param_5: number;
  param_6: number;
  modified: number;
}
