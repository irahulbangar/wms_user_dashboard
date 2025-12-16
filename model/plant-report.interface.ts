export interface PlantReportResponse {
  success: boolean;
  message: string;
  data: PlantReportResult;
}

export interface PlantReportResult {
  report: PlantReportData;
}

export interface PlantReportData {
  [key: string]: PlantReportItem;
}

export interface PlantReportItem {
  Flow: number;
  Flow_in: number;
  Flow_out: number;
  Percolation: number;
  Evaporation: number;
  Consumption: number;
  Wastage: number;
  Regeneration: number;
  "Re-use": number;
  Rainfall: number;
  Storage: number;
  "Neutrality-Index": number;
}
