export interface FmDeviceResponse {
  success: boolean;
  data: FmDeviceResultItem[];
  message: string;
}

export interface FmDeviceResultItem {
  id: number;
  device_id: number;
  interval_start: string;
  interval_end: string;
  min: string;
  max: string;
  avg: number;
  flow: number;
  from_time: string;
  to_time: string;
}
