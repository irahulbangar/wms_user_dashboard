export interface TankDeviceResponse {
  success: boolean;
  data: TankDeviceResultItem[];
  message: string;
}

export interface TankDeviceResultItem {
  id: number;
  device_id: number;
  from_time: string;
  to_time: string;
  first_level: number;
  last_level: number;
  min_level: number;
  max_level: number;
}
