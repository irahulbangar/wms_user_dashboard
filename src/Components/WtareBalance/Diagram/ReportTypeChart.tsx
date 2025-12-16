import React from "react";
import PieChart from "./PieChart";
import CollapsibleSection from "./CollapsibleSection";
import type { DevicesResult } from "../../../../model/devices.interface";
import {
  getDeviceValue,
  getReportTypeColor,
} from "../../../utils/deviceHelpers";

interface ReportTypeChartProps {
  title: string;
  devices: DevicesResult[];
  groupType: "system" | "department" | "plant";
  groupName: string;
  defaultExpanded?: boolean;
  groupId: number;
}

const ReportTypeChart: React.FC<ReportTypeChartProps> = ({
  title,
  devices,
  groupType,
  groupId,
  groupName: _groupName,
  defaultExpanded = false,
}) => {
  const allReportTypes = [
    "Flow In",
    "Flow Out",
    "Percolation",
    "Evaporation",
    "Consumption",
    "Wastage",
    "Regeneration",
    "Re-use",
    "Net Balance",
  ];

  const inReportType = ["In", "Evaporation", "Consumption", "Wastage"];

  const outReportType = ["Out", "Percolation", "Regeneration", "Re-use"];

  const reportTypeTotals = allReportTypes.map((reportType) => {
    let total = 0;

    if (reportType === "Flow In") {
      total = devices
        .filter((device) => {
          let hasInConnection = false;
          if (device.report_type === "Flow") {
            switch (groupType) {
              case "system":
                hasInConnection = device.in_system_id === groupId;
                break;
              case "department":
                hasInConnection = device.in_department_id === groupId;
                break;
              case "plant":
                hasInConnection = device.in_plant_id === groupId;
                break;
            }
          }
          return hasInConnection;
        })
        .reduce((sum, device) => sum + getDeviceValue(device), 0);
    } else if (reportType === "Flow Out") {
      total = devices
        .filter((device) => {
          let hasOutConnection = false;
          if (device.report_type === "Flow") {
            switch (groupType) {
              case "system":
                hasOutConnection = device.out_system_id === groupId;
                break;
              case "department":
                hasOutConnection = device.out_department_id === groupId;
                break;
              case "plant":
                hasOutConnection = device.out_plant_id === groupId;
                break;
            }
          }
          return hasOutConnection;
        })
        .reduce((sum, device) => sum + getDeviceValue(device), 0);
    } else if (reportType === "Net Balance") {
      let inTotal = 0;
      let outTotal = 0;
      inTotal = devices
        .filter((device) => {
          switch (groupType) {
            case "system":
              return (
                device.in_system_id === groupId &&
                (inReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
            case "department":
              return (
                device.in_department_id === groupId &&
                (inReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
            case "plant":
              return (
                device.in_plant_id === groupId &&
                (inReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
          }
        })
        .reduce((sum, device) => sum + getDeviceValue(device), 0);
      outTotal = devices
        .filter((device) => {
          switch (groupType) {
            case "system":
              return (
                device.out_system_id === groupId &&
                (outReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
            case "department":
              return (
                device.out_department_id === groupId &&
                (outReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
            case "plant":
              return (
                device.out_plant_id === groupId &&
                (outReportType.includes(device.report_type) ||
                  device.report_type === "Flow")
              );
          }
        })
        .reduce((sum, device) => sum + getDeviceValue(device), 0);
      total = inTotal - outTotal;
    } else {
      total = devices
        .filter((device) => {
          if (device.report_type === reportType) {
            switch (groupType) {
              case "system":
                return inReportType.includes(reportType)
                  ? device.in_system_id === groupId
                  : outReportType.includes(reportType)
                  ? device.out_system_id === groupId
                  : false;
              case "department":
                return inReportType.includes(reportType)
                  ? device.in_department_id === groupId
                  : outReportType.includes(reportType)
                  ? device.out_department_id === groupId
                  : false;
              case "plant":
                return inReportType.includes(reportType)
                  ? device.in_plant_id === groupId
                  : outReportType.includes(reportType)
                  ? device.out_plant_id === groupId
                  : false;
            }
          }
          return false;
        })
        .reduce((sum, device) => sum + getDeviceValue(device), 0);
    }

    return {
      reportType,
      total,
    };
  });

  const chartData = reportTypeTotals
    .filter((item) => item.total > 0 && item.reportType !== "Net Balance")
    .map((item) => ({
      name: item.reportType,
      value: item.total,
      color: getReportTypeColor(item.reportType),
    }));

  const getGroupTypeLabel = () => {
    switch (groupType) {
      case "system":
        return "System";
      case "department":
        return "Department";
      case "plant":
        return "Plant";
      default:
        return "Group";
    }
  };

  if (chartData.length === 0) {
    return (
      <CollapsibleSection title={title} defaultExpanded={defaultExpanded}>
        <div className="text-center py-8">
          <p className="text-text-secondary font-roboto">No data available</p>
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection title={title} defaultExpanded={defaultExpanded}>
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <PieChart
            data={chartData}
            title={`${getGroupTypeLabel()} Report Types`}
            height={200}
            width={250}
            showLegend={false}
            colors={chartData.map((item) => item.color)}
            unit={devices[0]?.unit}
          />
          <div className="flex items-center gap-1 flex-wrap">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div
                  className="w-4 h-2 rounded-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-roboto text-text-secondary whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary border border-border-primary overflow-hidden rounded-lg">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-1.5 text-left text-sm font-normal text-text-primary font-roboto border-b border-border-primary">
                  Report Type
                </th>
                <th className="px-4 py-1.5 text-right text-sm font-normal text-text-primary font-roboto border-b border-border-primary">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {reportTypeTotals
                .filter((item) => {
                  if (item.reportType === "Net Balance") {
                    const hasOtherData = reportTypeTotals.some(
                      (other) =>
                        other.reportType !== "Net Balance" && other.total > 0
                    );
                    return hasOtherData;
                  }
                  return item.total > 0;
                })
                .map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border-primary last:border-b-0"
                  >
                    <td className="px-4 py-3 truncate">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getReportTypeColor(
                              item.reportType
                            ),
                          }}
                        ></div>
                        <span className="text-sm text-text-primary font-roboto">
                          {item.reportType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right truncate">
                      <span className="text-sm font-normal text-text-primary font-roboto">
                        {devices[0]?.unit === "M^3"
                          ? (item.total / 1000).toFixed(1)
                          : item.total.toFixed(1)}{" "}
                        <span className="text-sm italic text-text-secondary font-roboto">
                          {devices[0]?.unit === "M^3" ? (
                            <>
                              m<sup>3</sup>
                            </>
                          ) : (
                            devices[0]?.unit
                          )}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ReportTypeChart;
