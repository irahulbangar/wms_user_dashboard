import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NoDataFound from "../NoDataFound";
import { getCurrentPlantId } from "../../utils/plantUtils";
import { Columns3Cog, FileText } from "lucide-react";
import { nodeTypes } from "./config/nodeTypes";
import { calculatePlantTotals } from "./utils/deviceFlowCalculations";
import DiagramSidebar from "./Diagram/DiagramSidebar";
import ZoomControls from "./Diagram/ZoomControls";
import DiagramBreadcrumb from "./Diagram/DiagramBreadcrumb";
import { downloadDiagramAsImage } from "./utils/downloadDiagram";
import { useDiagramData } from "./hooks/useDiagramData";
import { useDiagramNodes } from "./hooks/useDiagramNodes";
import { useZoomToGroup } from "./hooks/useZoomToGroup";
import { useDiagramInteractions } from "./hooks/useDiagramInteractions";
import { useGlobalWheelHandler } from "./hooks/useGlobalWheelHandler";
import DateSelection from "../Dashboard/DateSelection";
import { getPlantReport } from "../../../store/plantSlice";
import { getDateRange } from "../../utils/utils";
import type { PlantReportData } from "../../../model/plant-report.interface";
import { Error } from "../../utils/toast";

interface DiagramContentProps {
  onDiagramSidebarToggle?: (isOpen: boolean) => void;
  isDiagramSidebarOpen?: boolean;
}

const DiagramContent = ({ onDiagramSidebarToggle }: DiagramContentProps) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId()),
  )?.role;
  const plantId = localStorage.getItem("plantId");
  const organizationId = localStorage.getItem("organizationId");
  const { devices } = useAppSelector((state) => state.device);
  const { plants } = useAppSelector((state) => state.plant);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fitView, getNodes } = useReactFlow();

  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const initialMonthYear = useRef(getCurrentMonthYear());
  const [monthYear, setMonthYear] = useState(initialMonthYear.current);
  const [dateSelectionType, setDateSelectionType] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [durationType, setDurationType] = useState<
    "min" | "hour" | "day" | "month"
  >(() => {
    const defaultDateType = "monthly" as
      | "daily"
      | "monthly"
      | "yearly"
      | "custom";
    switch (defaultDateType) {
      case "daily":
        return "hour";
      case "monthly":
        return "day";
      case "yearly":
        return "month";
      case "custom":
        return "day";
      default:
        return "hour";
    }
  });

  useEffect(() => {
    switch (dateSelectionType) {
      case "daily":
        setDurationType("hour");
        break;
      case "monthly":
        setDurationType("day");
        break;
      case "yearly":
        setDurationType("month");
        break;
      case "custom":
        setDurationType("day");
        break;
      default:
        setDurationType("hour");
    }
  }, [dateSelectionType]);
  const [dailyDate, setDailyDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [yearlyDate, setYearlyDate] = useState(() => {
    return String(new Date().getFullYear());
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });

  const [plantReport, setPlantReport] = useState<PlantReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useDiagramData({ plantId, organizationId });
  const { nodes, edges } = useDiagramNodes({
    plants,
    devices,
    plantId,
    isSidebarOpen,
  });
  const { zoomToGroup, isZoomingRef } = useZoomToGroup({ devices });
  useGlobalWheelHandler();

  const handleSidebarToggle = useCallback(() => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    if (onDiagramSidebarToggle) {
      onDiagramSidebarToggle(newSidebarState);
    }
  }, [isSidebarOpen, onDiagramSidebarToggle]);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    if (onDiagramSidebarToggle) {
      onDiagramSidebarToggle(true);
    }
  }, [onDiagramSidebarToggle]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    if (onDiagramSidebarToggle) {
      onDiagramSidebarToggle(false);
    }
  }, [onDiagramSidebarToggle]);

  const {
    handleNodeClick,
    handleDoubleClick,
    handlePaneClick,
    handlePaneDoubleClick,
    handleWheel,
  } = useDiagramInteractions({
    devices,
    isSidebarOpen,
    setSelectedNode,
    handleSidebarToggle,
    openSidebar,
    closeSidebar,
    zoomToGroup,
  });

  const handleCloseSidebar = () => {
    if (isSidebarOpen) {
      handleSidebarToggle();
    }
  };

  const plantTotals = useMemo(() => {
    return calculatePlantTotals(devices, plantId || "");
  }, [devices, plantId]);

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

  const nodePlantId = useMemo(() => {
    if (isPlantGroup) {
      return selectedNode?.data?.plant_id || selectedNode?.data?.id;
    } else if (isDepartmentGroup || isSystemGroup) {
      return selectedNode?.data?.plant_id || Number(plantId);
    }
    return Number(plantId);
  }, [selectedNode, isPlantGroup, isDepartmentGroup, isSystemGroup, plantId]);

  const nodeDepartmentId = useMemo(() => {
    if (isDepartmentGroup) {
      return selectedNode?.data?.department_id || selectedNode?.data?.id;
    }
    return 0;
  }, [selectedNode, isDepartmentGroup]);

  const nodeSystemId = useMemo(() => {
    if (isSystemGroup) {
      return selectedNode?.data?.system_id || selectedNode?.data?.id;
    }
    return 0;
  }, [selectedNode, isSystemGroup]);

  const fetchPlantReport = useCallback(() => {
    if (!isAuthenticated || !nodePlantId) return;
    if (!isPlantGroup && !isDepartmentGroup && !isSystemGroup) return;

    setIsLoadingReport(true);

    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate,
    );

    // Determine payload based on node type:
    // Plant: plant_id, department_id: 0, system_id: 0
    // Department: plant_id, department_id, system_id: 0
    // System: plant_id, department_id: 0, system_id
    let departmentId = 0;
    let systemId = 0;

    if (isSystemGroup) {
      systemId = nodeSystemId;
      departmentId = 0;
    } else if (isDepartmentGroup) {
      departmentId = nodeDepartmentId;
      systemId = 0;
    } else {
      departmentId = 0;
      systemId = 0;
    }

    dispatch(
      getPlantReport({
        plant_id: Number(nodePlantId),
        department_id: Number(departmentId),
        system_id: Number(systemId),
        from_date: fromDate,
        to_date: toDate,
        duration: durationType,
      }),
    )
      .unwrap()
      .then((res) => {
        if (res.success && res.data?.report) {
          setPlantReport(res.data.report);
        } else {
          setPlantReport(null);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get plant report");
        setPlantReport(null);
      })
      .finally(() => {
        setIsLoadingReport(false);
      });
  }, [
    dispatch,
    isAuthenticated,
    nodePlantId,
    nodeDepartmentId,
    nodeSystemId,
    isPlantGroup,
    isDepartmentGroup,
    isSystemGroup,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    durationType,
  ]);

  const hasFetchedForNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !selectedNode ||
      (!isPlantGroup && !isDepartmentGroup && !isSystemGroup)
    ) {
      hasFetchedForNodeRef.current = null;
      setPlantReport(null);
      return;
    }

    const nodeKey = `${
      isPlantGroup ? "plant" : isDepartmentGroup ? "dept" : "system"
    }-${groupId || "none"}`;

    if (hasFetchedForNodeRef.current !== nodeKey) {
      hasFetchedForNodeRef.current = nodeKey;
      fetchPlantReport();
    }
  }, [
    selectedNode,
    isPlantGroup,
    isDepartmentGroup,
    isSystemGroup,
    groupId,
    fetchPlantReport,
  ]);

  const aggregatedWaterBalanceData = useMemo(() => {
    if (!plantReport) {
      return null;
    }

    const aggregated: Record<string, number> = {
      Flow_in: 0,
      Flow_out: 0,
      Percolation: 0,
      Evaporation: 0,
      Consumption: 0,
      Wastage: 0,
      Regeneration: 0,
      "Re-use": 0,
      Rainfall: 0,
    };

    const neutralityIndexValues: number[] = [];

    const entries = Object.entries(plantReport);

    entries.forEach(([dateKey, data]) => {
      try {
        const entryDate = new Date(dateKey);
        let shouldInclude = false;

        switch (dateSelectionType) {
          case "daily": {
            const selectedDate = new Date(dailyDate + "T00:00:00");
            shouldInclude =
              entryDate.getFullYear() === selectedDate.getFullYear() &&
              entryDate.getMonth() === selectedDate.getMonth() &&
              entryDate.getDate() === selectedDate.getDate();
            break;
          }
          case "monthly": {
            const [year, month] = monthYear.split("-");
            shouldInclude =
              entryDate.getFullYear() === Number(year) &&
              entryDate.getMonth() === Number(month) - 1;
            break;
          }
          case "yearly": {
            const year = Number(yearlyDate);
            shouldInclude = entryDate.getFullYear() === year;
            break;
          }
          case "custom": {
            const startDate = new Date(customStartDate + "T00:00:00");
            const endDate = new Date(customEndDate + "T23:59:59");
            shouldInclude = entryDate >= startDate && entryDate <= endDate;
            break;
          }
        }

        if (shouldInclude && data && typeof data === "object") {
          Object.entries(data).forEach(([key, value]) => {
            if (
              key !== "Storage" &&
              key !== "Flow" &&
              typeof value === "number" &&
              !isNaN(value)
            ) {
              if (key === "Neutrality-Index") {
                neutralityIndexValues.push(value);
              } else {
                aggregated[key] = (aggregated[key] || 0) + value;
              }
            }
          });
        }
      } catch (error) {
        console.warn("Error processing date entry:", dateKey, error);
      }
    });

    const averageNeutralityIndex =
      neutralityIndexValues.length > 0
        ? neutralityIndexValues.reduce((sum, val) => sum + val, 0) /
          neutralityIndexValues.length
        : 0;

    const hasData = Object.values(aggregated).some((value) => value > 0);

    if (!hasData) {
      return null;
    }

    return {
      flow_in: aggregated.Flow_in || 0,
      flow_out: aggregated.Flow_out || 0,
      percolation: aggregated.Percolation || 0,
      evaporation: aggregated.Evaporation || 0,
      consumption: aggregated.Consumption || 0,
      wastage: aggregated.Wastage || 0,
      regeneration: aggregated.Regeneration || 0,
      reuse: aggregated["Re-use"] || 0,
      rainfall: aggregated.Rainfall || 0,
      neutrality: averageNeutralityIndex,
    };
  }, [
    plantReport,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const totalNetBalance = useMemo(() => {
    if (!aggregatedWaterBalanceData) return 0;

    const waterBalanceInData =
      (aggregatedWaterBalanceData.flow_in || 0) +
      (aggregatedWaterBalanceData.rainfall || 0) +
      (aggregatedWaterBalanceData.regeneration || 0) +
      (aggregatedWaterBalanceData.reuse || 0);

    const waterBalanceOutData =
      (aggregatedWaterBalanceData.flow_out || 0) +
      (aggregatedWaterBalanceData.percolation || 0) +
      (aggregatedWaterBalanceData.consumption || 0) +
      (aggregatedWaterBalanceData.wastage || 0) +
      (aggregatedWaterBalanceData.evaporation || 0);

    return waterBalanceInData - waterBalanceOutData;
  }, [aggregatedWaterBalanceData]);

  useEffect(() => {
    if (isZoomingRef.current) return;

    if (nodes.length > 0) {
      fitView({
        padding: 0.1,
        minZoom: 0.1,
        maxZoom: 1.0,
        duration: 0,
      });
    }
  }, [nodes.length, fitView, isZoomingRef]);

  useEffect(() => {
    if (isZoomingRef.current) return;

    const timeoutId = setTimeout(() => {
      if (isZoomingRef.current) return;

      const currentNodes = getNodes();
      if (currentNodes.length > 0) {
        fitView({
          padding: 0.1,
          minZoom: 0.1,
          maxZoom: 1.0,
          duration: 0,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isSidebarOpen, getNodes, fitView, isZoomingRef]);

  if (nodes.length === 0) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-primary rounded-lg ${
          nodes.length === 0 ? "mt-2" : ""
        }`}
      >
        <NoDataFound
          icon={
            <Columns3Cog className="w-16 h-16 text-text-muted mx-auto mb-4" />
          }
          title="No diagram data available for this plant"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-primary relative">
      <div
        className={`flex items-center justify-between px-4 py-2 transition-all duration-100 ${
          isSidebarOpen ? "mr-80" : ""
        }`}
      >
        <div className="flex items-center justify-between w-full gap-4 flex-col md:flex-row flex-wrap">
          <DiagramBreadcrumb
            userRole={userRole}
            plantName={
              plants.find((p) => p.plant_id === Number(plantId))?.plant_name
            }
          />
          <div className="flex items-center gap-3">
            <DateSelection
              dateSelectionType={dateSelectionType}
              setDateSelectionType={setDateSelectionType}
              dailyDate={dailyDate}
              setDailyDate={setDailyDate}
              monthYear={monthYear}
              setMonthYear={setMonthYear}
              yearlyDate={yearlyDate}
              setYearlyDate={setYearlyDate}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
              durationType={durationType}
              setDurationType={setDurationType}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  fetchPlantReport();
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
              >
                <FileText className="w-5 h-5" />
                Get Data
              </button>
            </div>
            <ZoomControls onDownload={downloadDiagramAsImage} />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-primary overflow-hidden transition-all duration-100">
        <div className="h-full w-full">
          <ReactFlow
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            attributionPosition="bottom-left"
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            panOnScroll={true}
            preventScrolling={false}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleDoubleClick}
            onPaneClick={handlePaneClick}
            onDoubleClick={handlePaneDoubleClick}
            onWheel={handleWheel}
            minZoom={0.1}
            maxZoom={1.0}
            deleteKeyCode={null}
            multiSelectionKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>

      <DiagramSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        selectedNode={selectedNode}
        devices={devices}
        plantTotals={plantTotals}
        aggregatedWaterBalanceData={aggregatedWaterBalanceData}
        totalNetBalance={totalNetBalance}
        isLoadingReport={isLoadingReport}
        onFetchData={fetchPlantReport}
      />
    </div>
  );
};

interface DiagramPageProps {
  onDiagramSidebarToggle?: (isOpen: boolean) => void;
  isDiagramSidebarOpen?: boolean;
}

const DiagramPage = ({
  onDiagramSidebarToggle,
  isDiagramSidebarOpen,
}: DiagramPageProps) => {
  return (
    <ReactFlowProvider>
      <DiagramContent
        onDiagramSidebarToggle={onDiagramSidebarToggle}
        isDiagramSidebarOpen={isDiagramSidebarOpen}
      />
    </ReactFlowProvider>
  );
};

export default DiagramPage;
