import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Monitor,
  ChevronRight,
  X,
  Search,
  Building2,
  Factory,
  FileTextIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { DevicesResult } from "../../../model/devices.interface";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getDeviceByOrganizationIdAndPlantIdAndSystemId } from "../../../store/deviceSlice";
import NoDataFound from "../NoDataFound";
import { Error, Warning } from "../../utils/toast";
import AnalysisPieChartCard from "../Department/AnalysisPieChartCard";
import DeviceCard from "./DeviceCard";
import SystemHeader from "./SystemHeader";
import DeviceGridLoadingSkeleton from "./DeviceGridLoadingSkeleton";
import { getDeviceRoute, getReportTypeColor } from "../../utils/deviceHelpers";
import {
  calculateSystemWaterBalance,
  calculateSystemStorageBalance,
  getSystemWaterBalanceColors,
  getSystemStorageBalanceColors,
} from "../../utils/balanceCalculations";
import { calculateWaterBalanceData } from "../../utils/waterBalanceHelpers";
import domtoimage from "dom-to-image";
import { useLineChart } from "../Dashboard/hooks/useLineChart";
import { getCurrentPlantId } from "../../utils/plantUtils";
import WaterBalanceTable from "../Department/WaterBalanceTable";
import LineChartSkeleton from "../Dashboard/LineChartSkeleton";
import DateSelection from "../Dashboard/DateSelection";
import type { PlantReportData } from "../../../model/plant-report.interface";
import { getPlantReport } from "../../../store/plantSlice";
import { getDateRange } from "../../utils/utils";

declare global {
  interface Window {
    __captureSystemDevicesScreenshot?: () => Promise<string | null>;
  }
}

const SystemDevices = () => {
  const systemDevicesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { organizationId, plantId, systemId } = useParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId())
  )?.role;
  const [devices, setDevices] = useState<DevicesResult[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DevicesResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        return "min";
      case "monthly":
        return "hour";
      case "yearly":
        return "day";
      case "custom":
        return "day";
      default:
        return "min";
    }
  });
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

  const fetchPlantReport = useCallback(() => {
    if (!isAuthenticated) return;
    if (!plantId || !systemId) return;
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
        department_id: 0,
        system_id: Number(systemId),
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
    systemId,
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

  const systemWaterBalanceDaywiseReport = useMemo(() => {
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
            };
          }

          Object.entries(data).forEach(([key, value]) => {
            if (
              key !== "Storage" &&
              key !== "Flow" &&
              key !== "Neutrality-Index" &&
              typeof value === "number" &&
              !isNaN(value)
            ) {
              const keyMap: Record<string, keyof (typeof daywiseData)[string]> =
                {
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
    daywiseData: systemWaterBalanceDaywiseReport,
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

  const hasFetchedForSystemRef = useRef<string | null>(null);

  useEffect(() => {
    if (!plantId || !systemId) {
      hasFetchedForSystemRef.current = null;
      return;
    }

    const systemKey = `${plantId}-${systemId}`;

    if (hasFetchedForSystemRef.current !== systemKey) {
      hasFetchedForSystemRef.current = systemKey;
      fetchPlantReport();
    }
  }, [plantId, systemId, fetchPlantReport]);

  useEffect(() => {
    if (systemId) {
      setIsLoading(true);
      setDevices([]);
      setFilteredDevices([]);
    }
  }, [systemId]);

  const fetchDevices = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    if (organizationId && plantId && systemId) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantIdAndSystemId({
          organizationId: Number(organizationId),
          plantId: Number(plantId),
          systemId: Number(systemId),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            setDevices(res.data);
            setFilteredDevices(res.data);
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
  }, [dispatch, organizationId, plantId, systemId, isAuthenticated]);

  useEffect(() => {
    if (plantId && systemId) {
      fetchDevices();
    }
  }, [plantId, systemId, fetchDevices]);

  const waterBalanceData = useMemo(() => {
    return calculateWaterBalanceData(
      aggregatedWaterBalanceData,
      devices,
      calculateSystemWaterBalance,
      systemId || 0,
      false
    );
  }, [aggregatedWaterBalanceData, devices, systemId]);

  const waterBalanceColors = useMemo(() => getSystemWaterBalanceColors(), []);

  const storageBalanceData = useMemo(
    () => calculateSystemStorageBalance(devices, systemId || 0),
    [devices, systemId]
  );

  const storageBalanceColors = useMemo(
    () => getSystemStorageBalanceColors(),
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

  const waterQualityColors = useMemo(() => {
    return [
      getReportTypeColor("PH"),
      getReportTypeColor("EC"),
      getReportTypeColor("TDS"),
      getReportTypeColor("COD"),
      getReportTypeColor("BOD"),
    ];
  }, []);

  // Static water quality data - always show UI with all 5 metrics
  // Using small values (0.01) so the UI always displays (hasData check passes)
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

  useEffect(() => {
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(
        (device) =>
          device?.device_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device?.hwid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device?.device_type_id?.toString().includes(searchTerm) ||
          device?.device_family_id?.toString().includes(searchTerm) ||
          device?.device_status
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device?.system_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm]);

  const handleViewDevice = (device: DevicesResult) => {
    const route = getDeviceRoute(device, "system");
    if (route) {
      navigate(route);
    }
  };

  const getSystemName = (devices: DevicesResult[]) => {
    if (!devices || devices.length === 0) return "";
    return (
      devices.filter((device) => device.system_id === Number(systemId))[0]
        ?.system_name || ""
    );
  };

  const deviceStatusCounts = useMemo(() => {
    const active = filteredDevices.filter(
      (d) => d.device_status?.toLowerCase() === "active"
    ).length;
    const inactive = filteredDevices.filter(
      (d) => d.device_status?.toLowerCase() === "inactive"
    ).length;
    const other = filteredDevices.filter(
      (d) =>
        d.device_status?.toLowerCase() !== "active" &&
        d.device_status?.toLowerCase() !== "inactive"
    ).length;
    return { active, inactive, other };
  }, [filteredDevices]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    let retries = 0;
    while (!systemDevicesRef.current && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }
    if (!systemDevicesRef.current) return null;

    let originalStyle = "";
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let loadCheckAttempts = 0;
      const maxLoadAttempts = 100;
      while (loadCheckAttempts < maxLoadAttempts) {
        const loadingSkeletons = systemDevicesRef.current.querySelectorAll(
          '[class*="animate-pulse"]:not([style*="display: none"])'
        );
        const hasVisibleLoading = Array.from(loadingSkeletons).some(
          (el) => (el as HTMLElement).offsetParent !== null
        );

        const dataTable = systemDevicesRef.current.querySelector("table tbody");
        const hasTableData =
          dataTable &&
          dataTable.querySelectorAll("tr:not([class*='animate-pulse'])")
            .length > 0;

        const hasCharts =
          systemDevicesRef.current.querySelectorAll("canvas, svg").length > 0;

        const pieChartCards = systemDevicesRef.current.querySelectorAll(
          '[class*="card"], [class*="chart"]'
        );
        const hasPieCharts = pieChartCards.length > 0;

        if (!hasVisibleLoading && (hasTableData || hasCharts || hasPieCharts)) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        loadCheckAttempts++;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const images = systemDevicesRef.current.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 2000);
        });
      });
      await Promise.all(imagePromises);

      const canvasElements =
        systemDevicesRef.current.querySelectorAll("canvas");
      if (canvasElements.length > 0) {
        let dimensionReadyAttempts = 0;
        const maxDimensionAttempts = 30;
        while (dimensionReadyAttempts < maxDimensionAttempts) {
          const canvases = systemDevicesRef.current.querySelectorAll("canvas");
          let allHaveDimensions = true;

          for (const canvas of Array.from(canvases)) {
            const htmlCanvas = canvas as HTMLCanvasElement;
            if (htmlCanvas.width === 0 || htmlCanvas.height === 0) {
              allHaveDimensions = false;
              break;
            }
          }

          if (allHaveDimensions) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
          dimensionReadyAttempts++;
        }

        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvases = systemDevicesRef.current.querySelectorAll("canvas");
        let hasContent = false;
        let contentCheckAttempts = 0;
        const maxContentChecks = 20;

        while (!hasContent && contentCheckAttempts < maxContentChecks) {
          for (const canvas of Array.from(canvases)) {
            const htmlCanvas = canvas as HTMLCanvasElement;
            try {
              const ctx = htmlCanvas.getContext("2d", {
                willReadFrequently: true,
              });
              if (ctx && htmlCanvas.width > 0 && htmlCanvas.height > 0) {
                const centerX = Math.floor(htmlCanvas.width / 2);
                const centerY = Math.floor(htmlCanvas.height / 2);
                const imageData = ctx.getImageData(centerX, centerY, 1, 1);
                const alpha = imageData.data[3];
                const topLeft = ctx.getImageData(10, 10, 1, 1);
                const bottomRight = ctx.getImageData(
                  htmlCanvas.width - 10,
                  htmlCanvas.height - 10,
                  1,
                  1
                );
                if (
                  alpha > 0 ||
                  topLeft.data[3] > 0 ||
                  bottomRight.data[3] > 0
                ) {
                  hasContent = true;
                  break;
                }
              }
            } catch {
              // Continue checking
            }
          }

          if (hasContent) break;

          await new Promise((resolve) => setTimeout(resolve, 200));
          contentCheckAttempts++;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const element = systemDevicesRef.current;

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
        if (systemDevicesRef.current && originalStyle) {
          systemDevicesRef.current.style.cssText = originalStyle;
        }
      }
    } catch (error) {
      console.error("Failed to capture SystemDevices screenshot:", error);
      if (systemDevicesRef.current && originalStyle) {
        systemDevicesRef.current.style.cssText = originalStyle;
      }
      return null;
    }
  }, []);

  useEffect(() => {
    window.__captureSystemDevicesScreenshot = captureScreenshot;

    const originalFunction = captureScreenshot;
    window.__captureSystemDevicesScreenshot = async () => {
      try {
        const result = await originalFunction();
        return result;
      } catch (error) {
        console.error("[SystemDevices] Capture function error:", error);
        throw error;
      }
    };

    return () => {
      delete window.__captureSystemDevicesScreenshot;
    };
  }, [captureScreenshot]);

  return (
    <div ref={systemDevicesRef} className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between flex-col md:flex-row gap-3">
        <div className="flex items-center gap-3 flex-col md:flex-row">
          <nav className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit whitespace-nowrap">
            {userRole === "org_admin" && (
              <>
                <button
                  onClick={() => {
                    const organizationId =
                      localStorage.getItem("organizationId");
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
            <button
              onClick={() => {
                const departmentId = localStorage.getItem("departmentId");
                const organizationId = localStorage.getItem("organizationId");
                const plantId = localStorage.getItem("plantId");
                if (departmentId && organizationId && plantId) {
                  navigate(
                    `/department/device/${organizationId}/${plantId}/${departmentId}`
                  );
                }
              }}
              className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
            >
              <span className="text-text-primary font-normal font-roboto">
                Department
              </span>
            </button>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-normal font-roboto">
              System
            </span>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-normal font-roboto">
              {getSystemName(devices)}
            </span>
          </nav>
        </div>
      </div>
      <div className="flex items-center justify-between flex-col md:flex-row pt-3 gap-3">
        <div className="flex items-center gap-3 md:flex-row">
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
                if (!plantId || !systemId) {
                  Warning("Please select a plant and system to fetch data");
                  return;
                }
                fetchPlantReport();
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
              title="Get Data"
            >
              <FileTextIcon className="w-5 h-5" />
              Get Data
            </button>
          </div>
        </div>
        <div className="shrink-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search device"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-auto w-85 pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilteredDevices(devices);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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

        {isLoading ? (
          <DeviceGridLoadingSkeleton />
        ) : (
          <>
            <SystemHeader
              systemName={getSystemName(devices)}
              deviceCount={filteredDevices.length}
              deviceStatusCounts={deviceStatusCounts}
            />

            {filteredDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDevices.map((device, index) => (
                  <DeviceCard
                    key={index}
                    device={device}
                    onViewDevice={handleViewDevice}
                  />
                ))}
              </div>
            ) : (
              <div className="text-text-primary text-center font-roboto text-sm w-full h-full">
                <NoDataFound
                  icon={
                    <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  }
                  title={"No devices data found"}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemDevices;
