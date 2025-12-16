export interface OrganizationWaterBalanceDaywiseReportResponse {
  success: boolean;
  message: string;
  data: OrganizationWaterBalanceDaywiseReportData;
}

export interface OrganizationWaterBalanceDaywiseReportData {
  daywise: OrganizationWaterBalanceDaywise;
  report_name_wise: OrganizationWaterBalanceReportNameWise;
  plant_wise: PlantWaterBalanceWise;
  total: OrganizationWaterBalanceTotal;
}

export interface OrganizationWaterBalanceDaywise {
  [key: string]: OrganizationWaterBalanceDaywiseData;
}

export interface PlantWaterBalanceWise {
  [key: string]: PlantWaterBalanceData;
}

export interface PlantWaterBalanceData {
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

export interface OrganizationWaterBalanceDaywiseData {
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

export interface OrganizationWaterBalanceReportNameWise {
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

export interface OrganizationWaterBalanceTotal {
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
