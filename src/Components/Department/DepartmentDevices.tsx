import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronRight, Building2, Factory } from "lucide-react";
import DateSelection from "../Dashboard/DateSelection";
import { useNavigate } from "react-router-dom";
import type { DevicesResult } from "../../../model/devices.interface";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getDeviceByOrganizationIdAndPlantIdAndDepartmentId } from "../../../store/deviceSlice";
import { Error } from "../../utils/toast";
import { useParams } from "react-router-dom";
import domtoimage from "dom-to-image";
import AnalysisPieChartCard from "./AnalysisPieChartCard";
import SystemBalanceCard from "./SystemBalanceCard";
import { SystemBalanceLoadingSkeleton } from "./LoadingSkeletons";
import {
  calculateDepartmentStorageBalance,
  getDepartmentStorageBalanceColors,
  calculateDepartmentWaterBalance,
} from "../../utils/balanceCalculations";
import { calculateWaterBalanceData } from "../../utils/waterBalanceHelpers";
import { useLineChart } from "../Dashboard/hooks/useLineChart";
import { Warning } from "../../utils/toast";
import { FileTextIcon } from "lucide-react";
import { getCurrentPlantId } from "../../utils/plantUtils";
import WaterBalanceTable from "./WaterBalanceTable";
import { getReportTypeColor } from "../../utils/deviceHelpers";
import LineChartSkeleton from "../Dashboard/LineChartSkeleton";
import type { PlantReportData } from "../../../model/plant-report.interface";
import { getPlantReport } from "../../../store/plantSlice";
import { getDateRange } from "../../utils/utils";

declare global {
  interface Window {
    __captureDepartmentDevicesScreenshot?: () => Promise<string | null>;
  }
}

const DepartmentDevices = () => {
  const navigate = useNavigate();
  const { organizationId, plantId, departmentId } = useParams();
  const departmentDevicesRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(plantId)
  )?.role;
  const [devices, setDevices] = useState<DevicesResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const getDateTypeLabel = () => {
    if (!dateSelectionType) return "";
    return (
      dateSelectionType.charAt(0).toUpperCase() + dateSelectionType.slice(1)
    );
  };

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
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [yearlyDate, setYearlyDate] = useState(() => {
    return String(new Date().getFullYear());
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [plantReport, setPlantReport] = useState<PlantReportData | null>(null);
  const [systemReports, setSystemReports] = useState<
    Record<number, PlantReportData | null>
  >({});
  const [isLoadingSystems, setIsLoadingSystems] = useState(false);

  const fetchPlantReport = useCallback(() => {
    if (!isAuthenticated) return;
    if (!plantId || !departmentId) return;
    setIsLoading(true);
    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate
    );

    dispatch(
      getPlantReport({
        plant_id: Number(plantId),
        department_id: Number(departmentId),
        system_id: 0,
        from_date: fromDate,
        to_date: toDate,
        duration: durationType,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.success && res.data?.report) {
          setPlantReport(res.data.report);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get plant report");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    dispatch,
    plantId,
    departmentId,
    isAuthenticated,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    durationType,
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

  const departmentWaterBalanceDaywiseReport = useMemo(() => {
    if (!plantReport) return null;

    const daywiseData: Record<string, Record<string, number>> = {};

    const getDateKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minutes = date.getMinutes();

      switch (durationType) {
        case "min": {
          const roundedMinutes = Math.floor(minutes / 15) * 15;
          const roundedMins = String(roundedMinutes).padStart(2, "0");
          return `${year}-${month}-${day} ${hour}:${roundedMins}`;
        }
        case "hour": {
          return `${year}-${month}-${day} ${hour}:00`;
        }
        case "day": {
          return `${year}-${month}-${day}`;
        }
        case "month": {
          return `${year}-${month}`;
        }
        default:
          return `${year}-${month}-${day}`;
      }
    };

    Object.entries(plantReport).forEach(([dateKey, data]) => {
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
          const groupKey = getDateKey(entryDate);

          if (!daywiseData[groupKey]) {
            daywiseData[groupKey] = {
              flow_in: 0,
              flow_out: 0,
              percolation: 0,
              evaporation: 0,
              consumption: 0,
              wastage: 0,
              regeneration: 0,
              reuse: 0,
              rainfall: 0,
              neutrality: 0,
            };
          }

          if (!(daywiseData[groupKey] as any)._neutralityCount) {
            (daywiseData[groupKey] as any)._neutralityCount = 0;
            (daywiseData[groupKey] as any)._neutralitySum = 0;
          }

          Object.entries(data).forEach(([key, value]) => {
            if (
              key !== "Storage" &&
              key !== "Flow" &&
              typeof value === "number" &&
              !isNaN(value)
            ) {
              if (key === "Neutrality-Index") {
                (daywiseData[groupKey] as any)._neutralitySum += value;
                (daywiseData[groupKey] as any)._neutralityCount += 1;
              } else {
                const keyMap: Record<
                  string,
                  keyof (typeof daywiseData)[string]
                > = {
                  Flow_in: "flow_in",
                  Flow_out: "flow_out",
                  Percolation: "percolation",
                  Evaporation: "evaporation",
                  Consumption: "consumption",
                  Wastage: "wastage",
                  Regeneration: "regeneration",
                  "Re-use": "reuse",
                  Rainfall: "rainfall",
                };

                const mappedKey = keyMap[key];
                if (mappedKey) {
                  daywiseData[groupKey][mappedKey] += value;
                }
              }
            }
          });
        }
      } catch (error) {
        console.warn(
          "Error processing date entry for daywise data:",
          dateKey,
          error
        );
      }
    });

    Object.keys(daywiseData).forEach((groupKey) => {
      const dayData = daywiseData[groupKey] as any;
      if (dayData._neutralityCount && dayData._neutralityCount > 0) {
        dayData.neutrality = dayData._neutralitySum / dayData._neutralityCount;
      }
      delete dayData._neutralityCount;
      delete dayData._neutralitySum;
    });

    const hasData =
      Object.keys(daywiseData).length > 0 &&
      Object.values(daywiseData).some((dayData) =>
        Object.values(dayData).some((value) => value > 0)
      );

    return hasData ? daywiseData : null;
  }, [
    plantReport,
    dateSelectionType,
    durationType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const lineChartRef = useLineChart({
    daywiseData: departmentWaterBalanceDaywiseReport,
    unit: devices?.[0]?.unit || "",
  });

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

  const fetchDevices = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    if (plantId && organizationId && departmentId) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
          organizationId: Number(organizationId),
          plantId: Number(plantId),
          departmentId: Number(departmentId),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            setDevices(res.data);
          } else {
            Error(res.message || "Failed to get devices");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch, organizationId, plantId, departmentId, isAuthenticated]);

  const hasFetchedForDepartmentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!plantId || !departmentId) {
      hasFetchedForDepartmentRef.current = null;
      return;
    }

    const deptKey = `${plantId}-${departmentId}`;

    if (hasFetchedForDepartmentRef.current !== deptKey) {
      hasFetchedForDepartmentRef.current = deptKey;
      fetchPlantReport();
    }
  }, [plantId, departmentId, fetchPlantReport]);

  useEffect(() => {
    if (plantId && departmentId) {
      fetchDevices();
    }
  }, [plantId, departmentId, fetchDevices]);

  const waterBalanceData = useMemo(() => {
    return calculateWaterBalanceData(
      aggregatedWaterBalanceData,
      devices,
      calculateDepartmentWaterBalance,
      departmentId || 0,
      false
    );
  }, [aggregatedWaterBalanceData, devices, departmentId]);

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
    ],
    []
  );

  const storageBalanceData = useMemo(
    () => calculateDepartmentStorageBalance(devices, departmentId || 0),
    [devices, departmentId]
  );

  const storageBalanceColors = useMemo(
    () => getDepartmentStorageBalanceColors(),
    []
  );

  const waterNeutralityIndexColors = useMemo(() => {
    return [
      getReportTypeColor("Percolation"),
      getReportTypeColor("Wastage"),
      getReportTypeColor("Consumption"),
      getReportTypeColor("Regeneration"),
      getReportTypeColor("Evaporation"),
      getReportTypeColor("Re-use"),
    ];
  }, []);

  const waterQualityColors = useMemo(() => {
    return [
      getReportTypeColor("PH"),
      getReportTypeColor("EC"),
      getReportTypeColor("TDS"),
      getReportTypeColor("COD"),
      getReportTypeColor("BOD"),
    ];
  }, []);

  const waterQualityData = useMemo(() => {
    return [
      {
        name: "PH",
        value: 0.01,
        color: waterQualityColors[0],
      },
      {
        name: "EC",
        value: 0.01,
        color: waterQualityColors[1],
      },
      {
        name: "TDS",
        value: 0.01,
        color: waterQualityColors[2],
      },
      {
        name: "COD",
        value: 0.01,
        color: waterQualityColors[3],
      },
      {
        name: "BOD",
        value: 0.01,
        color: waterQualityColors[4],
      },
    ];
  }, [waterQualityColors]);

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
        color: waterNeutralityIndexColors[0],
      },
      {
        name: "Wastage",
        value: aggregatedWaterBalanceData.wastage || 0,
        color: waterNeutralityIndexColors[1],
      },
      {
        name: "Consumption",
        value: aggregatedWaterBalanceData.consumption || 0,
        color: waterNeutralityIndexColors[2],
      },
      {
        name: "Regeneration",
        value: aggregatedWaterBalanceData.regeneration || 0,
        color: waterNeutralityIndexColors[3],
      },
      {
        name: "Evaporation",
        value: aggregatedWaterBalanceData.evaporation || 0,
        color: waterNeutralityIndexColors[4],
      },
      {
        name: "Re-use",
        value: aggregatedWaterBalanceData.reuse || 0,
        color: waterNeutralityIndexColors[5],
      },
    ];
  }, [aggregatedWaterBalanceData, waterNeutralityIndexColors]);

  const waterNeutralityIndexValue = useMemo(() => {
    if (!aggregatedWaterBalanceData) return null;
    return aggregatedWaterBalanceData.neutrality || null;
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

  const hasStorageDataArray = useMemo(() => {
    return (
      storageBalanceData && storageBalanceData.length > 0 && devices.length > 0
    );
  }, [storageBalanceData, devices]);

  const uniqueSystems = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    const systemsMap = new Map<
      number,
      {
        id: number;
        name: string;
        unit: string;
        organizationId: string;
        plantId: string;
      }
    >();

    devices.forEach((device) => {
      if (device.system_id && device.system_name) {
        if (!systemsMap.has(device.system_id)) {
          systemsMap.set(device.system_id, {
            id: device.system_id,
            name: device.system_name,
            unit: device.unit || "",
            organizationId:
              device.organization_id?.toString() || organizationId || "",
            plantId: device.plant_id?.toString() || plantId || "",
          });
        }
      }
    });

    return Array.from(systemsMap.values()).sort((a, b) => a.id - b.id);
  }, [devices, organizationId, plantId]);

  const fetchSystemReports = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!plantId || !departmentId || uniqueSystems.length === 0) return;

    setIsLoadingSystems(true);
    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate
    );

    try {
      const systemPromises = uniqueSystems.map((system) =>
        dispatch(
          getPlantReport({
            plant_id: Number(plantId),
            department_id: 0,
            system_id: system.id,
            from_date: fromDate,
            to_date: toDate,
            duration: durationType,
          })
        )
          .unwrap()
          .then((res) => ({
            systemId: system.id,
            report: res.success && res.data?.report ? res.data.report : null,
          }))
          .catch((err) => {
            console.log(`Failed to fetch report for system ${system.id}:`, err);
            return { systemId: system.id, report: null };
          })
      );

      const results = await Promise.all(systemPromises);
      const reportsMap: Record<number, PlantReportData | null> = {};

      results.forEach(({ systemId, report }) => {
        reportsMap[systemId] = report;
      });

      setSystemReports(reportsMap);
    } catch (err) {
      console.log("Error fetching system reports:", err);
    } finally {
      setIsLoadingSystems(false);
    }
  }, [
    dispatch,
    plantId,
    departmentId,
    uniqueSystems,
    isAuthenticated,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    durationType,
  ]);

  const systemBalances = useMemo(() => {
    if (uniqueSystems.length === 0) return [];

    return uniqueSystems.map((system) => {
      const systemReport = systemReports[system.id];
      if (!systemReport) {
        return {
          id: system.id,
          name: system.name,
          totalIn: 0,
          totalOut: 0,
          balance: 0,
          unit: system.unit,
          organizationId: system.organizationId,
          plantId: system.plantId,
        };
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

      Object.entries(systemReport).forEach(([dateKey, data]) => {
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
                key !== "Neutrality-Index" &&
                typeof value === "number" &&
                !isNaN(value)
              ) {
                aggregated[key] = (aggregated[key] || 0) + value;
              }
            });
          }
        } catch (error) {
          console.warn("Error processing system date entry:", dateKey, error);
        }
      });

      const totalIn =
        (aggregated.Flow_in || 0) +
        (aggregated.Rainfall || 0) +
        (aggregated.Regeneration || 0) +
        (aggregated["Re-use"] || 0);

      const totalOut =
        (aggregated.Flow_out || 0) +
        (aggregated.Percolation || 0) +
        (aggregated.Consumption || 0) +
        (aggregated.Wastage || 0) +
        (aggregated.Evaporation || 0);

      return {
        id: system.id,
        name: system.name,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        unit: system.unit,
        organizationId: system.organizationId,
        plantId: system.plantId,
      };
    });
  }, [
    uniqueSystems,
    systemReports,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const lastFetchedSystemIdsRef = useRef<string>("");

  useEffect(() => {
    if (uniqueSystems.length === 0 || !plantId || !departmentId) {
      return;
    }

    const systemIdsKey = uniqueSystems
      .map((s) => s.id)
      .sort()
      .join(",");

    if (lastFetchedSystemIdsRef.current !== systemIdsKey) {
      lastFetchedSystemIdsRef.current = systemIdsKey;
      fetchSystemReports();
    }
  }, [uniqueSystems, plantId, departmentId, fetchSystemReports]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    let retries = 0;
    while (!departmentDevicesRef.current && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }
    if (!departmentDevicesRef.current) return null;

    let originalStyle = "";
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let loadCheckAttempts = 0;
      const maxLoadAttempts = 200;
      while (loadCheckAttempts < maxLoadAttempts) {
        const allSkeletons = departmentDevicesRef.current.querySelectorAll(
          '[class*="animate-pulse"]'
        );
        const visibleSkeletons = Array.from(allSkeletons).filter((el) => {
          const htmlEl = el as HTMLElement;
          return (
            htmlEl.offsetParent !== null &&
            htmlEl.style.display !== "none" &&
            window.getComputedStyle(htmlEl).display !== "none"
          );
        });

        const pieChartSkeletons = departmentDevicesRef.current.querySelectorAll(
          '.bg-card [class*="rounded-full"][class*="bg-input-bg"][class*="animate-pulse"]'
        );
        const hasPieChartSkeletons = Array.from(pieChartSkeletons).some(
          (el) => (el as HTMLElement).offsetParent !== null
        );

        const tableSkeletonRows = departmentDevicesRef.current.querySelectorAll(
          'table tbody tr[class*="animate-pulse"]'
        );
        const hasTableSkeletons = Array.from(tableSkeletonRows).some(
          (el) => (el as HTMLElement).offsetParent !== null
        );

        const skeletonCards = departmentDevicesRef.current.querySelectorAll(
          '[class*="LoadingSkeleton"], [class*="animate-pulse"]'
        );
        const hasSkeletonCards = Array.from(skeletonCards).some((el) => {
          const htmlEl = el as HTMLElement;
          const parent = htmlEl.closest(".bg-card, .grid");
          return (
            parent !== null &&
            htmlEl.offsetParent !== null &&
            htmlEl.style.display !== "none"
          );
        });

        const hasAnySkeletons =
          visibleSkeletons.length > 0 ||
          hasPieChartSkeletons ||
          hasTableSkeletons ||
          hasSkeletonCards;

        const dataTable =
          departmentDevicesRef.current.querySelector("table tbody");
        const tableRows = dataTable
          ? Array.from(
              dataTable.querySelectorAll("tr:not([class*='animate-pulse'])")
            ).filter((row) => {
              const text = row.textContent || "";
              return (
                text.trim().length > 0 &&
                !text.includes("w-full h-") &&
                row.querySelectorAll("td").length > 0
              );
            })
          : [];
        const hasTableData = tableRows.length > 0;

        const lineChartContainer = departmentDevicesRef.current.querySelector(
          '[class*="h-[300px]"], [class*="min-h-[300px]"]'
        );
        const lineChartCanvas = lineChartContainer
          ? lineChartContainer.querySelector("canvas")
          : null;
        const hasLineChart = lineChartCanvas !== null;

        const gridContainer =
          departmentDevicesRef.current.querySelector(".grid.grid-cols-1");
        const pieChartCards = gridContainer
          ? Array.from(gridContainer.querySelectorAll(".bg-card")).filter(
              (card) => {
                const hasCanvas = card.querySelector("canvas") !== null;
                const hasSkeleton = card.querySelector(
                  '[class*="rounded-full"][class*="bg-input-bg"][class*="animate-pulse"]'
                );
                return hasCanvas && !hasSkeleton;
              }
            )
          : [];
        const hasPieCharts = pieChartCards.length > 0;

        const allGrids = departmentDevicesRef.current.querySelectorAll(".grid");
        let systemBalanceGrid: Element | null = null;
        for (const grid of Array.from(allGrids)) {
          const hasSystemBalance = grid.querySelector(
            '[class*="SystemBalance"], [class*="balance"]'
          );
          if (hasSystemBalance) {
            systemBalanceGrid = grid;
            break;
          }
        }
        const systemBalanceCards = systemBalanceGrid
          ? Array.from(systemBalanceGrid.querySelectorAll(".bg-card")).filter(
              (card) => {
                const text = card.textContent || "";
                return (
                  text.trim().length > 0 &&
                  !text.includes("No systems found") &&
                  !card.querySelector('[class*="animate-pulse"]')
                );
              }
            )
          : [];
        const hasSystemBalances = systemBalanceCards.length > 0;

        const deviceSections = departmentDevicesRef.current.querySelectorAll(
          '[class*="SystemGroup"], [class*="device"]'
        );
        const hasDeviceSections = deviceSections.length > 0;
        const deviceRows = departmentDevicesRef.current.querySelectorAll(
          'tbody tr:not([class*="animate-pulse"])'
        );
        const hasDeviceRows = deviceRows.length > 0;

        const allDataReady =
          !hasAnySkeletons &&
          hasTableData &&
          hasLineChart &&
          (hasPieCharts || pieChartCards.length === 0) &&
          (hasSystemBalances || systemBalanceCards.length === 0) &&
          (hasDeviceSections || hasDeviceRows || deviceRows.length === 0);

        if (allDataReady) {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const finalSkeletonCheck =
            departmentDevicesRef.current.querySelectorAll(
              '[class*="animate-pulse"]'
            );
          const finalVisibleSkeletons = Array.from(finalSkeletonCheck).filter(
            (el) => (el as HTMLElement).offsetParent !== null
          );

          if (finalVisibleSkeletons.length === 0) {
            break;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        loadCheckAttempts++;
      }

      const collapsedElements = departmentDevicesRef.current.querySelectorAll(
        '[class*="collapsed"], [aria-expanded="false"]'
      );
      if (collapsedElements.length > 0) {
        collapsedElements.forEach((el) => {
          const button = el.closest("button");
          if (button) {
            button.click();
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 500));

        let expansionCheckAttempts = 0;
        const maxExpansionChecks = 30;
        while (expansionCheckAttempts < maxExpansionChecks) {
          const stillCollapsed = departmentDevicesRef.current.querySelectorAll(
            '[class*="collapsed"], [aria-expanded="false"]'
          );
          if (stillCollapsed.length === 0) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
          expansionCheckAttempts++;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const images = departmentDevicesRef.current.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 2000);
        });
      });
      await Promise.all(imagePromises);

      const gridContainer =
        departmentDevicesRef.current.querySelector(".grid.grid-cols-1");
      const pieChartContainers = gridContainer
        ? Array.from(gridContainer.querySelectorAll(".bg-card")).filter(
            (card) => {
              return card.querySelector("canvas") !== null;
            }
          )
        : [];
      const expectedPieCharts = pieChartContainers.length;

      let dimensionReadyAttempts = 0;
      const maxDimensionAttempts = 50;
      while (dimensionReadyAttempts < maxDimensionAttempts) {
        const canvases =
          departmentDevicesRef.current.querySelectorAll("canvas");
        let allHaveDimensions = true;
        let pieChartCanvasesFound = 0;

        for (const canvas of Array.from(canvases)) {
          const htmlCanvas = canvas as HTMLCanvasElement;
          const parentCard = canvas.closest(".bg-card");
          const gridParent = parentCard?.closest(".grid.grid-cols-1");
          if (parentCard && gridParent) {
            pieChartCanvasesFound++;
          }
          if (htmlCanvas.width === 0 || htmlCanvas.height === 0) {
            allHaveDimensions = false;
            break;
          }
        }

        if (
          allHaveDimensions &&
          (expectedPieCharts === 0 ||
            pieChartCanvasesFound >= expectedPieCharts)
        ) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        dimensionReadyAttempts++;
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvases = departmentDevicesRef.current.querySelectorAll("canvas");
      let allPieChartsHaveContent = expectedPieCharts === 0;
      let contentCheckAttempts = 0;
      const maxContentChecks = 30;

      while (
        !allPieChartsHaveContent &&
        contentCheckAttempts < maxContentChecks
      ) {
        let pieChartsWithContent = 0;

        for (const canvas of Array.from(canvases)) {
          const htmlCanvas = canvas as HTMLCanvasElement;
          const parentCard = canvas.closest(".bg-card");
          const gridParent = parentCard?.closest(".grid.grid-cols-1");

          if (parentCard && gridParent) {
            try {
              const ctx = htmlCanvas.getContext("2d", {
                willReadFrequently: true,
              });
              if (ctx && htmlCanvas.width > 0 && htmlCanvas.height > 0) {
                const centerX = Math.floor(htmlCanvas.width / 2);
                const centerY = Math.floor(htmlCanvas.height / 2);
                const quarterX = Math.floor(htmlCanvas.width / 4);
                const quarterY = Math.floor(htmlCanvas.height / 4);
                const threeQuarterX = Math.floor((htmlCanvas.width * 3) / 4);
                const threeQuarterY = Math.floor((htmlCanvas.height * 3) / 4);

                const centerData = ctx.getImageData(centerX, centerY, 1, 1);
                const topLeftData = ctx.getImageData(10, 10, 1, 1);
                const topRightData = ctx.getImageData(
                  htmlCanvas.width - 10,
                  10,
                  1,
                  1
                );
                const bottomLeftData = ctx.getImageData(
                  10,
                  htmlCanvas.height - 10,
                  1,
                  1
                );
                const bottomRightData = ctx.getImageData(
                  htmlCanvas.width - 10,
                  htmlCanvas.height - 10,
                  1,
                  1
                );
                const quarterData = ctx.getImageData(quarterX, quarterY, 1, 1);
                const threeQuarterData = ctx.getImageData(
                  threeQuarterX,
                  threeQuarterY,
                  1,
                  1
                );

                const hasContent =
                  centerData.data[3] > 0 ||
                  topLeftData.data[3] > 0 ||
                  topRightData.data[3] > 0 ||
                  bottomLeftData.data[3] > 0 ||
                  bottomRightData.data[3] > 0 ||
                  quarterData.data[3] > 0 ||
                  threeQuarterData.data[3] > 0;

                if (hasContent) {
                  pieChartsWithContent++;
                }
              }
            } catch {
              // Continue checking
            }
          }
        }

        if (
          expectedPieCharts === 0 ||
          pieChartsWithContent >= expectedPieCharts
        ) {
          allPieChartsHaveContent = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
        contentCheckAttempts++;
      }

      const lineChartContainer = departmentDevicesRef.current.querySelector(
        '[class*="h-[300px]"], [class*="min-h-[300px]"]'
      );
      const lineChartCanvas = lineChartContainer
        ? (lineChartContainer.querySelector("canvas") as HTMLCanvasElement)
        : null;
      if (lineChartCanvas) {
        let lineChartReady = false;
        let lineChartAttempts = 0;
        const maxLineChartChecks = 20;
        while (!lineChartReady && lineChartAttempts < maxLineChartChecks) {
          try {
            const ctx = lineChartCanvas.getContext("2d", {
              willReadFrequently: true,
            });
            if (
              ctx &&
              lineChartCanvas.width > 0 &&
              lineChartCanvas.height > 0
            ) {
              const centerX = Math.floor(lineChartCanvas.width / 2);
              const centerY = Math.floor(lineChartCanvas.height / 2);
              const imageData = ctx.getImageData(centerX, centerY, 1, 1);
              const alpha = imageData.data[3];
              if (alpha > 0) {
                lineChartReady = true;
                break;
              }
            }
          } catch {
            // Continue checking
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
          lineChartAttempts++;
        }
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalSkeletons = departmentDevicesRef.current.querySelectorAll(
        '[class*="animate-pulse"]'
      );
      const finalVisibleSkeletons = Array.from(finalSkeletons).filter((el) => {
        const htmlEl = el as HTMLElement;
        return (
          htmlEl.offsetParent !== null &&
          htmlEl.style.display !== "none" &&
          window.getComputedStyle(htmlEl).display !== "none"
        );
      });

      if (finalVisibleSkeletons.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const retrySkeletons = departmentDevicesRef.current.querySelectorAll(
          '[class*="animate-pulse"]'
        );
        const retryVisible = Array.from(retrySkeletons).filter((el) => {
          const htmlEl = el as HTMLElement;
          return htmlEl.offsetParent !== null;
        });
        if (retryVisible.length > 0) {
          console.warn(
            "Warning: Some skeleton elements still visible, proceeding anyway"
          );
        }
      }

      const element = departmentDevicesRef.current;

      originalStyle = element.style.cssText;

      element.style.height = "auto";
      element.style.maxHeight = "none";
      element.style.overflow = "visible";

      void element.offsetHeight;
      void element.offsetWidth;

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rect = element.getBoundingClientRect();

      const allHeights = [
        element.scrollHeight,
        element.offsetHeight,
        element.clientHeight,
        rect?.height,
        element.scrollHeight ||
          element.offsetHeight ||
          element.clientHeight ||
          rect?.height ||
          0,
      ].filter((h) => h > 0);

      const maxWidth = 2400;
      const maxHeight = 3200;

      const scrollWidth = Math.min(
        Math.max(
          element.scrollWidth || 0,
          element.offsetWidth || 0,
          rect?.width || 0
        ),
        maxWidth
      );
      const scrollHeight = Math.min(Math.max(...allHeights, 0), maxHeight);

      try {
        const svgDataUrl = await domtoimage.toSvg(element, {
          width: scrollWidth,
          height: scrollHeight,
          style: {
            width: `${scrollWidth}px`,
            height: `${scrollHeight}px`,
          },
          quality: 1,
          filter: (node: Node) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "NAV" ||
              el.classList?.contains("search") ||
              (el.tagName === "BUTTON" && el.textContent?.includes("Search"))
            ) {
              return false;
            }
            return true;
          },
        });

        const img = new Image();
        img.crossOrigin = "anonymous";

        const dataUrl = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = 1.5;
            canvas.width = scrollWidth * scale;
            canvas.height = scrollHeight * scale;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(scale, scale);
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.85));
            } else {
              reject("Could not get canvas context");
            }
          };
          img.onerror = reject;
          img.src = svgDataUrl;
        });

        return dataUrl;
      } catch (svgError) {
        console.warn("SVG capture failed, trying PNG:", svgError);
        const jpegDataUrl = await domtoimage.toJpeg(element, {
          width: scrollWidth,
          height: scrollHeight,
          quality: 0.85,
          filter: (node: Node) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "NAV" ||
              el.classList?.contains("search") ||
              (el.tagName === "BUTTON" && el.textContent?.includes("Search"))
            ) {
              return false;
            }
            return true;
          },
        });
        return jpegDataUrl;
      } finally {
        if (departmentDevicesRef.current && originalStyle) {
          departmentDevicesRef.current.style.cssText = originalStyle;
        }
      }
    } catch (error) {
      console.error("Failed to capture DepartmentDevices screenshot:", error);
      if (departmentDevicesRef.current && originalStyle) {
        departmentDevicesRef.current.style.cssText = originalStyle;
      }
      return null;
    }
  }, []);

  useEffect(() => {
    window.__captureDepartmentDevicesScreenshot = captureScreenshot;

    const originalFunction = captureScreenshot;
    window.__captureDepartmentDevicesScreenshot = async () => {
      try {
        const result = await originalFunction();
        return result;
      } catch (error) {
        console.error("[DepartmentDevices] Capture function error:", error);
        throw error;
      }
    };

    return () => {
      delete window.__captureDepartmentDevicesScreenshot;
    };
  }, [captureScreenshot]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newPlantId = localStorage.getItem("plantId");
      const newOrganizationId = localStorage.getItem("organizationId");
      const newDepartmentId = localStorage.getItem("departmentId");
      if (
        newPlantId &&
        newOrganizationId &&
        newDepartmentId &&
        (newPlantId !== plantId ||
          newOrganizationId !== organizationId ||
          newDepartmentId !== departmentId)
      ) {
        setIsLoading(true);
        dispatch(
          getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
            plantId: Number(newPlantId),
            organizationId: Number(newOrganizationId),
            departmentId: Number(newDepartmentId),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              setDevices(res.data);
            } else {
              Error(res.message || "Failed to get devices");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to get devices");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener("plantChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("plantChanged", handleStorageChange);
    };
  }, [dispatch, plantId, organizationId, departmentId]);

  const getDepartmentNames = (devices: DevicesResult[]) => {
    if (!departmentId || devices.length === 0) return "";
    const departmentNames = devices
      .filter((device) => device.department_id === Number(departmentId))
      .map((device) => device.department_name);
    return [...new Set(departmentNames)].join(", ") || "";
  };

  return (
    <div ref={departmentDevicesRef} className="flex flex-col w-full h-full">
      <div className="flex items-center gap-3 flex-col md:flex-row">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit whitespace-nowrap">
          {userRole === "org_admin" && (
            <>
              <button
                onClick={() => {
                  const organizationId = localStorage.getItem("organizationId");
                  if (organizationId) {
                    navigate(`/organization/${organizationId}`);
                  }
                }}
                className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-text-primary font-normal font-roboto">
                  Organization
                </span>
              </button>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </>
          )}
          <button
            onClick={() => {
              const plantId = getCurrentPlantId();
              if (plantId) {
                navigate(`/plant/${plantId}`);
              }
            }}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            {userRole === "org_user" && <Factory className="w-4 h-4" />}
            <span className="text-text-primary font-normal font-roboto">
              Plant
            </span>
          </button>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal font-roboto">
            Department
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal font-roboto">
            {getDepartmentNames(devices)}
          </span>
        </nav>
        <div className="flex items-center gap-3 flex-col md:flex-row">
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
                if (!plantId || !departmentId) {
                  Warning("Please select a plant and department to fetch data");
                  return;
                }
                fetchPlantReport();
                if (uniqueSystems.length > 0) {
                  fetchSystemReports();
                }
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
              title="Get Data"
            >
              <FileTextIcon className="w-5 h-5" />
              Get Data
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnalysisPieChartCard
            title="Water Balance"
            data={waterBalanceData}
            colors={waterBalanceColors}
            isLoading={isLoading || !hasWaterBalanceDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={null}
          />
          <AnalysisPieChartCard
            title="Water Neutrality Index"
            data={waterNeutralityIndexData}
            colors={waterNeutralityIndexColors}
            isLoading={isLoading || !hasWaterNeutralityDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={waterNeutralityIndexValue}
          />
          <AnalysisPieChartCard
            title="Storage Analysis"
            data={storageBalanceData}
            colors={storageBalanceColors}
            isLoading={isLoading || !hasStorageDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={null}
          />
          {/* Static Water Quality Card */}
          <div className="bg-card rounded-lg px-4 py-1 shadow-md flex flex-col items-center h-full">
            <h3 className="text-text-primary text-base font-normal font-roboto whitespace-nowrap">
              Water Quality
            </h3>
            <div className="flex items-center justify-start flex-col h-full w-full">
              <div className="flex flex-col items-center justify-center mt-3">
                <div className="w-[150px] h-[150px] rounded-full bg-input-bg flex items-center justify-center">
                  <span className="text-text-secondary text-sm font-roboto">
                    No Data Available
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap justify-center mt-4">
                {waterQualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="w-4 h-2 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-roboto text-text-primary whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
              Water Balance {dateSelectionType && getDateTypeLabel()}
            </h3>
          </div>
          {isLoading ? (
            <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
              <LineChartSkeleton />

              <WaterBalanceTable
                reportData={null}
                totalNetBalance={0}
                unit={devices[0]?.unit || ""}
                isLoading={true}
              />
            </div>
          ) : (
            <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
              <div className="h-[300px] md:h-auto md:min-h-[300px] w-full bg-card rounded-lg p-2">
                <div ref={lineChartRef} className="w-full h-full"></div>
              </div>
              <WaterBalanceTable
                reportData={
                  aggregatedWaterBalanceData as Record<string, number> | null
                }
                totalNetBalance={totalNetBalance}
                unit={devices[0]?.unit || ""}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        <h1 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
          Systems Water Balance
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading || isLoadingSystems ? (
            [1, 2, 3, 4].map((i) => <SystemBalanceLoadingSkeleton key={i} />)
          ) : systemBalances.length > 0 ? (
            systemBalances.map((sys) => (
              <div
                key={sys.id}
                onClick={() => {
                  if (sys.organizationId && sys.plantId && sys.id) {
                    localStorage.setItem("systemId", sys.id.toString());
                    navigate(
                      `/system/device/${sys.organizationId}/${sys.plantId}/${sys.id}`
                    );
                  }
                }}
                className="cursor-pointer hover:shadow-lg hover:bg-hover-bg-primary transition-all duration-200"
              >
                <SystemBalanceCard system={{ ...sys, unit: sys.unit }} />
              </div>
            ))
          ) : (
            <div className="bg-card rounded-lg px-4 py-3 shadow-md">
              <div className="flex flex-col gap-2">
                <h3 className="text-text-secondary text-sm font-medium">
                  No systems found
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDevices;
