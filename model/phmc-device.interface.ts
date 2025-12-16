export interface PhmcDeviceResponse {
    success: boolean
    data: PhmcDeviceResultItem[]
    message: string
  }
  
  export interface PhmcDeviceResultItem {
    id: number
    device_id: number
    from_time: string
    to_time: string
    first_record: FirstRecord
    last_record: LastRecord
  }
  
  export interface FirstRecord {
    KWh?: string
    IMEI?: string
    KVAh?: string
    Time?: string
    date?: string
    flowrate?: string
    Current_b?: string
    Current_r?: string
    Current_y?: string
    Fault_Bit?: string
    Frequency?: string
    totalizer?: string
    voltage_b?: number
    voltage_r?: number
    voltage_y?: number
    pumpstatus?: string
    String_Type?: string
    Active_Power?: string
    BatteryLevel?: string
    power_factor?: string
    Apparent_Power?: string
    Reactive_Power?: string
    SignalStrength?: string
    Motor_Running_Mode?: string
  }
  
  export interface LastRecord {
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
  