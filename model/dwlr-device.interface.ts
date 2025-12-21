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
  msg_time: string;
  water_column_from_ground: number;
  modified: number;
  interval_start: string;
  interval_end: string;
  water_column: string;
  water_temperature: string;
  water_pressure: string;
  ambient_temperature: string;
  ambient_pressure: string;
  sensor_voltage: string;
  battery_voltage: string;
  param_1: string;
  param_2: string;
  param_3: string;
  param_4: string;
  param_5: string;
  param_6: string;
}
