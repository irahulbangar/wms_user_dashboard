export interface PlantWaterBalanceDaywiseReportResponse {
  success: boolean;
  message: string;
  data: PlantWaterBalanceDaywiseReportData;
}

export interface PlantWaterBalanceDaywiseReportData {
  daywise: PlantWaterBalanceDaywise;
  report_name_wise: PlantWaterBalanceReportNameWise;
  department_wise: DepartmentWaterBalanceWise;
  total: PlantWaterBalanceTotal;
}

export interface PlantWaterBalanceDaywise {
  [key: string]: PlantWaterBalanceDaywiseData;
}

export interface DepartmentWaterBalanceWise {
  [key: string]: DepartmentWaterBalanceData;
}

export interface DepartmentWaterBalanceData {
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

export interface PlantWaterBalanceDaywiseData {
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

export interface PlantWaterBalanceReportNameWise {
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

export interface PlantWaterBalanceTotal {
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
