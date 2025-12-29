import React, { useMemo } from "react";
import { X, Database } from "lucide-react";
import { StorageChart } from "./GroupCharts";
import type { DevicesResult } from "../../../../model/devices.interface";
import CollapsibleSection from "./CollapsibleSection";
import { getReportTypeColor } from "../../../utils/deviceHelpers";
import WaterBalanceTable from "../../Department/WaterBalanceTable";
import { calculateWaterBalanceData } from "../../../utils/waterBalanceHelpers";
import {
  calculatePlantWaterBalance,
  calculateDepartmentWaterBalance,
  calculateSystemWaterBalance,
} from "../../../utils/balanceCalculations";
import AnalysisPieChartCard from "../../Department/AnalysisPieChartCard";
import NoDataFound from "../../NoDataFound";

interface DiagramSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: any;
  devices: DevicesResult[];
  plantTotals: {
    totalStock: number;
    totalCapacity: number;
    totalIn: number;
    totalOut: number;
    totalBalance: number;
  };
  aggregatedWaterBalanceData: {
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
  } | null;
  totalNetBalance: number;
  isLoadingReport: boolean;
  onFetchData: () => void;
}

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  isOpen,
  onClose,
  selectedNode,
  devices,
  plantTotals: _plantTotals,
  aggregatedWaterBalanceData,
  totalNetBalance,
  isLoadingReport,
}) => {
  const isPlantGroup = selectedNode?.data?.groupType === "plant";
  const isDepartmentGroup = selectedNode?.data?.groupType === "department";
  const isSystemGroup = selectedNode?.data?.groupType === "system";

  const groupId = useMemo(() => {
    if (isPlantGroup) {
      return selectedNode?.data?.plant_id || selectedNode?.data?.id;
    } else if (isDepartmentGroup) {
      return selectedNode?.data?.department_id || selectedNode?.data?.id;
    } else if (isSystemGroup) {
      return selectedNode?.data?.system_id || selectedNode?.data?.id;
    }
    return null;
  }, [selectedNode, isPlantGroup, isDepartmentGroup, isSystemGroup]);

  const waterBalanceData = useMemo(() => {
    if (isPlantGroup) {
      return calculateWaterBalanceData(
        aggregatedWaterBalanceData,
        devices,
        calculatePlantWaterBalance,
        groupId,
        false
      );
    } else if (isDepartmentGroup) {
      return calculateWaterBalanceData(
        aggregatedWaterBalanceData,
        devices,
        calculateDepartmentWaterBalance,
        groupId,
        false
      );
    } else if (isSystemGroup) {
      return calculateWaterBalanceData(
        aggregatedWaterBalanceData,
        devices,
        calculateSystemWaterBalance,
        groupId,
        false
      );
    }
    return [];
  }, [
    aggregatedWaterBalanceData,
    devices,
    groupId,
    isPlantGroup,
    isDepartmentGroup,
    isSystemGroup,
  ]);

  const waterBalanceColors = useMemo(
    () => [
      getReportTypeColor("Flow In"),
      getReportTypeColor("Flow Out"),
      getReportTypeColor("Percolation"),
      getReportTypeColor("Evaporation"),
      getReportTypeColor("Consumption"),
      getReportTypeColor("Wastage"),
      getReportTypeColor("Regeneration"),
      getReportTypeColor("Re-use"),
      getReportTypeColor("Rainfall"),
    ],
    []
  );

  const waterNeutralityIndexData = useMemo(() => {
    if (!aggregatedWaterBalanceData) {
      return [];
    }
    const hasData =
      (aggregatedWaterBalanceData.percolation || 0) > 0 ||
      (aggregatedWaterBalanceData.wastage || 0) > 0 ||
      (aggregatedWaterBalanceData.consumption || 0) > 0 ||
      (aggregatedWaterBalanceData.regeneration || 0) > 0 ||
      (aggregatedWaterBalanceData.evaporation || 0) > 0 ||
      (aggregatedWaterBalanceData.reuse || 0) > 0;

    if (!hasData) {
      return [];
    }

    return [
      {
        name: "Percolation",
        value: aggregatedWaterBalanceData.percolation || 0,
        color: getReportTypeColor("Percolation"),
      },
      {
        name: "Wastage",
        value: aggregatedWaterBalanceData.wastage || 0,
        color: getReportTypeColor("Wastage"),
      },
      {
        name: "Consumption",
        value: aggregatedWaterBalanceData.consumption || 0,
        color: getReportTypeColor("Consumption"),
      },
      {
        name: "Regeneration",
        value: aggregatedWaterBalanceData.regeneration || 0,
        color: getReportTypeColor("Regeneration"),
      },
      {
        name: "Evaporation",
        value: aggregatedWaterBalanceData.evaporation || 0,
        color: getReportTypeColor("Evaporation"),
      },
      {
        name: "Re-use",
        value: aggregatedWaterBalanceData.reuse || 0,
        color: getReportTypeColor("Re-use"),
      },
    ];
  }, [aggregatedWaterBalanceData]);

  const waterNeutralityIndexValue = useMemo(() => {
    if (!aggregatedWaterBalanceData) return 0;
    return aggregatedWaterBalanceData.neutrality === 0
      ? 0.00001
      : aggregatedWaterBalanceData.neutrality;
  }, [aggregatedWaterBalanceData]);

  const hasWaterBalanceDataArray = useMemo(() => {
    return (
      waterBalanceData &&
      waterBalanceData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices.length > 0
    );
  }, [waterBalanceData, aggregatedWaterBalanceData, devices]);

  const hasWaterNeutralityDataArray = useMemo(() => {
    return (
      waterNeutralityIndexData &&
      waterNeutralityIndexData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices.length > 0
    );
  }, [waterNeutralityIndexData, aggregatedWaterBalanceData, devices]);

  if (!isOpen) return null;

  const getGroupTypeLabel = () => {
    if (isPlantGroup) return "Plant";
    if (isDepartmentGroup) return "Department";
    if (isSystemGroup) return "System";
    return "Group";
  };

  return (
    <div className="fixed right-0 top-0 h-full w-84 bg-primary border-l border-border-primary shadow-lg z-50 overflow-y-auto md:block">
      <div className="p-4">
        <div className="flex flex-col items-start">
          <div className="flex w-83 items-center justify-between top-0 fixed right-0 bg-primary z-10 px-4 py-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-status-info" />
              <div className="flex flex-col">
                <h2
                  className="text-xl font-normal text-text-primary font-roboto flex items-center gap-2 truncate max-w-60"
                  title={selectedNode?.data?.label || "Group Overview"}
                >
                  {selectedNode?.data?.label || "Group Overview"}
                </h2>
                <p className="text-sm text-text-secondary font-roboto">
                  {getGroupTypeLabel()} Group
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="hover:bg-hover-bg-primary rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-18">
          {selectedNode && selectedNode.type === "group" ? (
            <>
              <StorageChart
                totalIn={
                  isSystemGroup
                    ? selectedNode.data.systemTotalIn || 0
                    : isDepartmentGroup
                    ? selectedNode.data.totalIn || 0
                    : selectedNode.data.plantTotalIn || 0
                }
                totalOut={
                  isSystemGroup
                    ? selectedNode.data.systemTotalOut || 0
                    : isDepartmentGroup
                    ? selectedNode.data.totalOut || 0
                    : selectedNode.data.plantTotalOut || 0
                }
                totalStock={selectedNode.data.totalStock || 0}
                totalCapacity={selectedNode.data.totalCapacity || 0}
                unit={devices[0]?.unit || ""}
                groupType={
                  isSystemGroup
                    ? "system"
                    : isDepartmentGroup
                    ? "department"
                    : "plant"
                }
                groupName={selectedNode.data.label}
              />

              {hasWaterNeutralityDataArray ? (
                <CollapsibleSection
                  title={`${getGroupTypeLabel()} Water Neutrality Index`}
                  defaultExpanded={true}
                >
                  <div className="flex flex-col gap-4">
                    <AnalysisPieChartCard
                      title={`${getGroupTypeLabel()} Water Neutrality Index`}
                      data={waterNeutralityIndexData}
                      colors={waterNeutralityIndexData.map(
                        (item) => item.color
                      )}
                      isLoading={isLoadingReport}
                      neutralityIndexValue={waterNeutralityIndexValue}
                      context={
                        isPlantGroup
                          ? undefined
                          : isDepartmentGroup
                          ? "department"
                          : "system"
                      }
                    />
                  </div>
                </CollapsibleSection>
              ) : isLoadingReport ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-text-secondary font-roboto text-sm">
                    Loading...
                  </div>
                </div>
              ) : (
                <NoDataFound
                  title="No water neutrality index data available"
                  icon={<Database className="w-12 h-12 text-text-muted" />}
                />
              )}

              {hasWaterBalanceDataArray ? (
                <CollapsibleSection
                  title="Water Balance"
                  defaultExpanded={true}
                >
                  <div className="flex flex-col gap-4">
                    {hasWaterBalanceDataArray ? (
                      <AnalysisPieChartCard
                        title={`${getGroupTypeLabel()} Water Balance`}
                        data={waterBalanceData}
                        colors={waterBalanceColors}
                        isLoading={isLoadingReport}
                        noDataMessage="No data found"
                        neutralityIndexValue={null}
                        context={
                          isPlantGroup
                            ? undefined
                            : isDepartmentGroup
                            ? "department"
                            : "system"
                        }
                      />
                    ) : isLoadingReport ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-text-secondary font-roboto text-sm">
                          Loading...
                        </div>
                      </div>
                    ) : (
                      <NoDataFound
                        title="No water balance data available"
                        icon={
                          <Database className="w-12 h-12 text-text-muted" />
                        }
                      />
                    )}
                    <WaterBalanceTable
                      reportData={
                        aggregatedWaterBalanceData as unknown as Record<
                          string,
                          number
                        > | null
                      }
                      totalNetBalance={totalNetBalance}
                      unit={devices[0]?.unit || ""}
                      isLoading={isLoadingReport}
                    />
                  </div>
                </CollapsibleSection>
              ) : isLoadingReport ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-text-secondary font-roboto text-sm">
                    Loading...
                  </div>
                </div>
              ) : (
                <NoDataFound
                  title="No water balance data available"
                  icon={<Database className="w-12 h-12 text-text-muted" />}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiagramSidebar;
