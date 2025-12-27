export interface SmartDeviceResponse {
  success: boolean;
  data: SmartDeviceResultItem[];
  message: string;
}

export interface SmartDeviceResultItem {
  id: number;
  device_id: number;
  from_time: string;
  to_time: string;
  first_record: Record<string, any>;
  last_record: Record<string, any>;
}

