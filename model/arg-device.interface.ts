export interface ArgDeviceResponse {
  success: boolean;
  data: ArgDeviceResultItem[];
  message: string;
}

export interface ArgDeviceResultItem {
  id: number;
  device_id: number;
  from_time: string;
  to_time: string;
  last_mm: number;
  first_mm: number;
  min_mm: number;
  max_mm: number;
  interval_start: string;
  interval_end: string;
}
