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
  first_record: FirstRecord;
  last_record: LastRecord;
}

export interface FirstRecord {
  temp1: number;
  temp2: number;
  temp3: number;
  humidity: number;
  power: number;
  flow: number;
  level: number;
}

export interface LastRecord {
  temp1: number;
  temp2: number;
  temp3: number;
  humidity: number;
  power: number;
  flow: number;
  level: number;
}
