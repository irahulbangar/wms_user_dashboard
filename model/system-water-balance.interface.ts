export interface SystemWaterBalanceDaywiseReportResponse {
  success: boolean;
  message: string;
  data: SystemWaterBalanceDaywiseReportData;
}

export interface SystemWaterBalanceDaywiseReportData {
  daywise: SystemWaterBalanceDaywise;
  report_name_wise: SystemWaterBalanceReportNameWise;
  total: SystemWaterBalanceTotal;
}

export interface SystemWaterBalanceDaywise {
  [key: string]: SystemWaterBalanceDaywiseData;
}

export interface SystemWaterBalanceDaywiseData {
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

export interface SystemWaterBalanceReportNameWise {
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

export interface SystemWaterBalanceTotal {
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