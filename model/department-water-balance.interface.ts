export interface DepartmentWaterBalanceDaywiseReportResponse {
  success: boolean;
  message: string;
  data: DepartmentWaterBalanceDaywiseReportData;
}

export interface DepartmentWaterBalanceDaywiseReportData {
  daywise: DepartmentWaterBalanceDaywise;
  report_name_wise: DepartmentWaterBalanceReportNameWise;
  system_wise: SystemWaterBalanceWise;
  total: DepartmentWaterBalanceTotal;
}

export interface DepartmentWaterBalanceDaywise {
  [key: string]: DepartmentWaterBalanceDaywiseData;
}

export interface SystemWaterBalanceWise {
  [key: string]: SystemWaterBalanceData;
}

export interface SystemWaterBalanceData {
  flow_in: number;
  flow_out: number;
  percolation: number;
  evaporation: number;
  consumption: number;
  wastage: number;
  regeneration: number;
  reuse: number;
  rainfall: number;
  neutrality: number;
}

export interface DepartmentWaterBalanceDaywiseData {
  flow_in: number;
  flow_out: number;
  percolation: number;
  evaporation: number;
  consumption: number;
  wastage: number;
  regeneration: number;
  reuse: number;
  rainfall: number;
  neutrality: number;
}

export interface DepartmentWaterBalanceReportNameWise {
  flow_in: number;
  flow_out: number;
  consumption: number;
  regeneration: number;
  percolation: number;
  evaporation: number;
  wastage: number;
  reuse: number;
  rainfall: number;
  neutrality: number;
}

export interface DepartmentWaterBalanceTotal {
  flow_in: number;
  flow_out: number;
  consumption: number;
  regeneration: number;
  percolation: number;
  evaporation: number;
  wastage: number;
  reuse: number;
  rainfall: number;
  neutrality: number;
}
