import { getReportTypeColor } from "./deviceHelpers";
import type { DevicesResult } from "../../model/devices.interface";

interface ReportNameWise {
  flow_in?: number;
  flow_out?: number;
  percolation?: number;
  evaporation?: number;
  consumption?: number;
  wastage?: number;
  regeneration?: number;
  reuse?: number;
  rainfall?: number;
}

interface WaterBalanceDataItem {
  name: string;
  value: number;
  color: string;
}

type CalculateWaterBalanceFn = (
  devices: DevicesResult[],
  id: number,
) => WaterBalanceDataItem[];

/**
 * Common function to calculate water balance data
 * Used in Dashboard, DepartmentDevices, and SystemDevices components
 */
export const calculateWaterBalanceData = (
  reportNameWise: ReportNameWise | null | undefined,
  devices: DevicesResult[] | null | undefined,
  calculateFn: CalculateWaterBalanceFn,
  id: number | string | null | undefined,
  shouldReturnEmptyData: boolean = false,
): WaterBalanceDataItem[] => {
  if (reportNameWise) {
    const hasData =
      (reportNameWise.flow_in || 0) > 0 ||
      (reportNameWise.flow_out || 0) > 0 ||
      (reportNameWise.percolation || 0) > 0 ||
      (reportNameWise.evaporation || 0) > 0 ||
      (reportNameWise.consumption || 0) > 0 ||
      (reportNameWise.wastage || 0) > 0 ||
      (reportNameWise.regeneration || 0) > 0 ||
      (reportNameWise.reuse || 0) > 0 ||
      (reportNameWise.rainfall || 0) > 0;

    if (!hasData) {
      return [];
    }

    return [
      {
        name: "Flow In",
        value: reportNameWise.flow_in || 0,
        color: getReportTypeColor("Flow In"),
      },
      {
        name: "Flow Out",
        value: reportNameWise.flow_out || 0,
        color: getReportTypeColor("Flow Out"),
      },
      {
        name: "Percolation",
        value: reportNameWise.percolation || 0,
        color: getReportTypeColor("Percolation"),
      },
      {
        name: "Evaporation",
        value: reportNameWise.evaporation || 0,
        color: getReportTypeColor("Evaporation"),
      },
      {
        name: "Consumption",
        value: reportNameWise.consumption || 0,
        color: getReportTypeColor("Consumption"),
      },
      {
        name: "Wastage",
        value: reportNameWise.wastage || 0,
        color: getReportTypeColor("Wastage"),
      },
      {
        name: "Regeneration",
        value: reportNameWise.regeneration || 0,
        color: getReportTypeColor("Regeneration"),
      },
      {
        name: "Re-use",
        value: reportNameWise.reuse || 0,
        color: getReportTypeColor("Re-use"),
      },
      {
        name: "Rainfall",
        value: reportNameWise.rainfall || 0,
        color: getReportTypeColor("Rainfall"),
      },
    ];
  }

  if (shouldReturnEmptyData && devices && devices.length > 0 && id) {
    return [
      { name: "Flow In", value: 0, color: getReportTypeColor("Flow In") },
      { name: "Flow Out", value: 0, color: getReportTypeColor("Flow Out") },
      {
        name: "Percolation",
        value: 0,
        color: getReportTypeColor("Percolation"),
      },
      {
        name: "Evaporation",
        value: 0,
        color: getReportTypeColor("Evaporation"),
      },
      {
        name: "Consumption",
        value: 0,
        color: getReportTypeColor("Consumption"),
      },
      { name: "Wastage", value: 0, color: getReportTypeColor("Wastage") },
      {
        name: "Regeneration",
        value: 0,
        color: getReportTypeColor("Regeneration"),
      },
      { name: "Re-use", value: 0, color: getReportTypeColor("Re-use") },
      { name: "Rainfall", value: 0, color: getReportTypeColor("Rainfall") },
    ];
  }

  return calculateFn(devices || [], Number(id) || 0);
};
