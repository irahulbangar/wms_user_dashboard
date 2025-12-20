import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Building2, ChevronRight, FileTextIcon } from "lucide-react";
import DateSelection from "./DateSelection";
import reportDashboardImg from "../../assets/images/dashboard.png";
import reportDepartmentImg from "../../assets/images/department.png";
import reportSystemImg from "../../assets/images/system.png";
import reportDaigramImg from "../../assets/images/daigram.png";
import {
  getDeviceByOrganizationIdAndPlantId,
  setDevices,
} from "../../../store/deviceSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Error, Warning } from "../../utils/toast";
import { getCurrentPlantId } from "../../utils/plantUtils";
import { useLineChart } from "./hooks/useLineChart";
import { DownloadReportDropdown } from "./DownloadReportDropdown";
import { WaterBalanceSection } from "./WaterBalanceSection";
import { calculateWaterBalanceData } from "../../utils/waterBalanceHelpers";
import {
  createReportWrapper,
  updateDateElement,
  updateOrganizationInfo,
  type SectionVisibility,
  type OrganizationInfo,
  type ReportData,
} from "./utils/reportHelpers";
import {
  setupScreenshotSections,
  setupCharts,
  setupWaterBalanceSection,
  setupWaterNeutralityIndexSection,
  setupStorageSection,
  setupDetailedReportSection,
} from "./utils/reportGeneration";
import {
  captureDashboardScreenshot,
  captureDepartmentScreenshot,
  captureSystemScreenshot,
  capturePlantDiagramScreenshot,
} from "./utils/screenshotUtils";
import { getReportTypeColor } from "../../utils/deviceHelpers";
import {
  calculatePlantWaterBalance,
  calculateStorageBalance,
} from "../../utils/balanceCalculations";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getDepartmentsByPlantId,
  setDepartments,
} from "../../../store/departmentSlice";
import { getSystemsByPlantId, setSystems } from "../../../store/systemSlice";
import AnalysisPieChartCard from "../Department/AnalysisPieChartCard";
import type { PlantReportData } from "../../../model/plant-report.interface";
import { getDateRange } from "../../utils/utils";
import { getPlantReport } from "../../../store/plantSlice";
import type { DepartmentResult } from "../../../model/department.interface";
import type { SystemResult } from "../../../model/system.interface";
import { DepartmentBalanceCards } from "./DepartmentBalanceCards";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const dashboardRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const plantIdFromUrl = useMemo(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (location.pathname.startsWith("/plant/") && pathParts.length >= 2) {
      return pathParts[1];
    }
    return null;
  }, [location.pathname]);

  const plantId = plantIdFromUrl || localStorage.getItem("plantId");
  const organizationId = localStorage.getItem("organizationId");
  const dispatch = useAppDispatch();
  const { devices } = useAppSelector((state) => state.device);
  const { departments } = useAppSelector((state) => state.department);
  const { systems } = useAppSelector((state) => state.system);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(() => {
    return localStorage.getItem("isDownloadingReport") === "true";
  });
  const [reportProgress, setReportProgress] = useState({
    percentage: 0,
    timeRemaining: 0,
    status: "Preparing report...",
  });
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<
    Set<number>
  >(new Set());
  const [selectedSystemIds, setSelectedSystemIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedSections, setSelectedSections] = useState<SectionVisibility>({
    dashboard: true,
    plantDiagram: true,
    system: true,
    department: true,
    waterNeutralityIndex: true,
    storageAnalysis: true,
    waterBalance: true,
    detailedReport: true,
  });
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const systemDropdownRef = useRef<HTMLDivElement>(null);
  const departmentChevronRef = useRef<HTMLButtonElement>(null);
  const systemChevronRef = useRef<HTMLButtonElement>(null);
  const hasInitializedDepartments = useRef(false);
  const hasInitializedSystems = useRef(false);
  const lastFetchedPlantIdRef = useRef<string | null>(null);
  const lastFetchedSystemsPlantIdRef = useRef<string | null>(null);
  const lastFetchedMonthYearRef = useRef<string | null>(null);
  const lastFetchedDevicesParamsRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId())
  )?.role;
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
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });
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

  const [plantReport, setPlantReport] = useState<PlantReportData | null>(null);
  const [departmentReports, setDepartmentReports] = useState<
    Record<number, PlantReportData | null>
  >({});
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const fetchPlantReport = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

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
        system_id: 0,
        from_date: fromDate,
        to_date: toDate,
        duration: durationType,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
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
    durationType,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    isAuthenticated,
  ]);

  const hasFetchedForPlantRef = useRef<string | null>(null);

  const fetchDepartments = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    if (plantId && lastFetchedPlantIdRef.current !== plantId) {
      lastFetchedPlantIdRef.current = plantId;
      dispatch(getDepartmentsByPlantId(Number(plantId)))
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDepartments(res.data));
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get departments");
        });
    }
  }, [dispatch, plantId, isAuthenticated]);

  const fetchSystems = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    if (plantId && lastFetchedSystemsPlantIdRef.current !== plantId) {
      lastFetchedSystemsPlantIdRef.current = plantId;
      dispatch(getSystemsByPlantId(Number(plantId)))
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setSystems(res.data));
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get systems");
        });
    }
  }, [dispatch, plantId, isAuthenticated]);

  useEffect(() => {
    if (plantId) {
      fetchDepartments();
      fetchSystems();
    }
  }, [plantId, fetchDepartments, fetchSystems]);

  useEffect(() => {
    if (plantIdFromUrl) {
      localStorage.setItem("plantId", plantIdFromUrl);
    }
  }, [plantIdFromUrl]);

  useEffect(() => {
    if (plantId) {
      setIsLoading(true);
      setSelectedDepartmentIds(new Set());
      setSelectedSystemIds(new Set());
      hasInitializedDepartments.current = false;
      hasInitializedSystems.current = false;
      if (lastFetchedPlantIdRef.current !== plantId) {
        lastFetchedPlantIdRef.current = null;
        lastFetchedMonthYearRef.current = null;
        lastFetchedDevicesParamsRef.current = null;
      }
      if (lastFetchedSystemsPlantIdRef.current !== plantId) {
        lastFetchedSystemsPlantIdRef.current = null;
      }
    }
  }, [plantId]);

  const fetchDevices = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    if (organizationId && plantId) {
      const paramsKey = `${organizationId}-${plantId}`;
      if (lastFetchedDevicesParamsRef.current === paramsKey) {
        return;
      }

      lastFetchedDevicesParamsRef.current = paramsKey;
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          organizationId: Number(organizationId),
          plantId: Number(plantId),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res.data));
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
  }, [dispatch, organizationId, plantId, isAuthenticated]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    if (!isDownloadDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDownload = downloadDropdownRef.current?.contains(target);
      const isInsideDept = departmentDropdownRef.current?.contains(target);
      const isInsideSystem = systemDropdownRef.current?.contains(target);
      const isDepartmentChevron =
        departmentChevronRef.current?.contains(target);
      const isSystemChevron = systemChevronRef.current?.contains(target);

      if (!isInsideDownload) {
        setIsDownloadDropdownOpen(false);
        setIsDepartmentDropdownOpen(false);
        setIsSystemDropdownOpen(false);
      } else if (
        isDepartmentDropdownOpen &&
        !isInsideDept &&
        !isDepartmentChevron
      ) {
        setIsDepartmentDropdownOpen(false);
      } else if (isSystemDropdownOpen && !isInsideSystem && !isSystemChevron) {
        setIsSystemDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDownloadDropdownOpen, isDepartmentDropdownOpen, isSystemDropdownOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkDownloadingState = () => {
      const isDownloading =
        localStorage.getItem("isDownloadingReport") === "true";
      setIsDownloadingReport(isDownloading);
    };

    checkDownloadingState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isDownloadingReport") {
        checkDownloadingState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleReportComplete = () => {
      checkDownloadingState();
    };

    window.addEventListener("reportDownloadComplete", handleReportComplete);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "reportDownloadComplete",
        handleReportComplete
      );
    };
  }, []);

  useEffect(() => {
    if (!isDownloadingReport) {
      setReportProgress({
        percentage: 0,
        timeRemaining: 0,
        status: "Preparing report...",
      });
      return;
    }

    const startTime = Date.now();

    const updateTimeRemaining = () => {
      if (!isDownloadingReport) {
        return;
      }

      setReportProgress((prev) => {
        const elapsed = Date.now() - startTime;
        const elapsedSeconds = elapsed / 1000;
        const currentPercentage = prev.percentage;

        let remaining = 0;

        if (currentPercentage > 0 && currentPercentage < 100) {
          const progressRate = currentPercentage / elapsedSeconds;
          const remainingPercentage = 100 - currentPercentage;
          remaining = Math.ceil(remainingPercentage / progressRate);
        } else if (currentPercentage === 0) {
          remaining = Math.max(0, Math.ceil(60 - elapsedSeconds));
        } else if (currentPercentage >= 100) {
          remaining = 0;
        }

        return {
          ...prev,
          timeRemaining: Math.max(0, remaining),
        };
      });
    };

    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDownloadingReport]);

  const plantIdNum = useMemo(() => Number(plantId) || 0, [plantId]);

  const plantDepartments = useMemo(() => {
    if (!plantIdNum || !departments) return [];
    return departments.filter((d) => Number(d.plant_id) === plantIdNum);
  }, [departments, plantIdNum]);

  const plantSystems = useMemo(() => {
    if (!plantIdNum || !systems) return [];
    return systems.filter((s) => Number(s.plant_id) === plantIdNum);
  }, [systems, plantIdNum]);

  const plantName = useMemo(() => {
    if (!plantIdNum) return "";

    const plantDevices =
      devices?.filter((d) => d.plant_id === plantIdNum) || [];
    const plantDepartments =
      departments?.filter((d) => d.plant_id === plantIdNum) || [];
    const plantSystems =
      systems?.filter((s) => s.plant_id === plantIdNum) || [];

    return (
      plantDevices[0]?.plant_name ||
      plantDepartments[0]?.plant_name ||
      plantSystems[0]?.plant_name ||
      devices?.[0]?.plant_name ||
      departments?.[0]?.plant_name ||
      systems?.[0]?.plant_name ||
      ""
    );
  }, [plantIdNum, devices, departments, systems]);

  const storageBalanceData = useMemo(() => {
    if (!devices || devices.length === 0 || !plantIdNum) {
      return [
        { name: "Total Stock", value: 0, color: "#5070de" },
        { name: "Available Capacity", value: 0, color: "#7da6d2" },
      ];
    }
    return calculateStorageBalance(devices, plantIdNum);
  }, [devices, plantIdNum]);

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

  const waterBalanceData = useMemo(() => {
    return calculateWaterBalanceData(
      aggregatedWaterBalanceData,
      devices,
      calculatePlantWaterBalance,
      plantIdNum,
      false
    );
  }, [devices, plantIdNum, aggregatedWaterBalanceData]);

  const plantWaterBalanceDaywiseReport = useMemo(() => {
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
    daywiseData: plantWaterBalanceDaywiseReport,
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

  const storageBalanceColors = useMemo(() => ["#5070de", "#7da6d2"], []);
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

  const uniqueDepartments = useMemo(() => {
    if (!devices || devices.length === 0) return [];

    const departmentsMap = new Map<
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
      if (device.department_id && device.department_name) {
        const deptId = Number(device.department_id);
        if (!departmentsMap.has(deptId)) {
          departmentsMap.set(deptId, {
            id: deptId,
            name: device.department_name,
            unit: device.unit || "",
            organizationId:
              device.organization_id?.toString() || organizationId || "",
            plantId: device.plant_id?.toString() || plantId || "",
          });
        }
      }
    });

    return Array.from(departmentsMap.values());
  }, [devices, organizationId, plantId]);

  const fetchDepartmentReports = useCallback(() => {
    if (!isAuthenticated) return;
    if (!plantId || uniqueDepartments.length === 0) return;

    setIsLoadingDepartments(true);

    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate
    );

    const promises = uniqueDepartments.map((dept) => {
      return dispatch(
        getPlantReport({
          plant_id: Number(plantId),
          department_id: dept.id,
          system_id: 0,
          from_date: fromDate,
          to_date: toDate,
          duration: durationType,
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success && res.data.report) {
            return { deptId: dept.id, report: res.data.report };
          }
          return { deptId: dept.id, report: null };
        })
        .catch((err) => {
          console.warn(
            `Failed to fetch report for department ${dept.id}:`,
            err
          );
          return { deptId: dept.id, report: null };
        });
    });

    Promise.all(promises)
      .then((results) => {
        const reports: Record<number, PlantReportData | null> = {};
        results.forEach(({ deptId, report }) => {
          reports[deptId] = report;
        });
        setDepartmentReports(reports);
      })
      .finally(() => {
        setIsLoadingDepartments(false);
      });
  }, [
    dispatch,
    plantId,
    uniqueDepartments,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    durationType,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (plantId && hasFetchedForPlantRef.current !== plantId) {
      hasFetchedForPlantRef.current = plantId;
      fetchPlantReport();
    }
    if (!plantId) {
      hasFetchedForPlantRef.current = null;
    }
  }, [plantId, fetchPlantReport]);

  const hasFetchedDeptReportsRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      plantId &&
      uniqueDepartments.length > 0 &&
      isAuthenticated &&
      hasFetchedForPlantRef.current === plantId
    ) {
      const deptKey = `${plantId}-${uniqueDepartments
        .map((d) => d.id)
        .sort()
        .join(",")}`;

      if (hasFetchedDeptReportsRef.current !== deptKey) {
        hasFetchedDeptReportsRef.current = deptKey;
        fetchDepartmentReports();
      }
    }
    if (!plantId) {
      hasFetchedDeptReportsRef.current = null;
    }
  }, [plantId, uniqueDepartments, fetchDepartmentReports, isAuthenticated]);

  const departmentBalances = useMemo(() => {
    if (uniqueDepartments.length === 0) return [];

    return uniqueDepartments.map((dept) => {
      const deptReport = departmentReports[dept.id];
      if (!deptReport) {
        return {
          id: dept.id,
          name: dept.name,
          totalIn: 0,
          totalOut: 0,
          balance: 0,
          unit: dept.unit,
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

      Object.entries(deptReport).forEach(([dateKey, data]) => {
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
          console.warn(
            "Error processing department date entry:",
            dateKey,
            error
          );
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
        id: dept.id,
        name: dept.name,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        unit: dept.unit,
      };
    });
  }, [
    uniqueDepartments,
    departmentReports,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  useEffect(() => {
    if (!plantIdNum) return;

    const plantDepartments =
      departments?.filter((dept) => dept.plant_id === plantIdNum) || [];

    if (
      plantDepartments.length &&
      !hasInitializedDepartments.current &&
      selectedDepartmentIds.size === 0
    ) {
      setSelectedDepartmentIds(
        new Set(plantDepartments.map((d) => d.department_id))
      );
      hasInitializedDepartments.current = true;
    }
  }, [departments, selectedDepartmentIds.size, plantIdNum]);

  useEffect(() => {
    if (!plantIdNum) return;

    const plantSystems =
      systems?.filter((sys) => sys.plant_id === plantIdNum) || [];

    if (
      plantSystems.length &&
      !hasInitializedSystems.current &&
      selectedSystemIds.size === 0
    ) {
      setSelectedSystemIds(new Set(plantSystems.map((s) => s.system_id)));
      hasInitializedSystems.current = true;
    }
  }, [systems, selectedSystemIds.size, plantIdNum]);

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    localStorage.setItem("isDownloadingReport", "true");
    setReportProgress({
      percentage: 0,
      timeRemaining: 60,
      status: "Preparing report...",
    });

    let fetchedDepartments = departments || [];
    let fetchedSystems = systems || [];

    if (plantId && (!departments || departments.length === 0)) {
      console.log("[Report] Fetching departments...");
      try {
        const deptRes = await dispatch(
          getDepartmentsByPlantId(Number(plantId))
        ).unwrap();
        if (deptRes.success && deptRes.data) {
          dispatch(setDepartments(deptRes.data));
          fetchedDepartments = deptRes.data;
          console.log(
            `[Report] Fetched ${deptRes.data.length} departments from API`
          );
        }
      } catch (err) {
        console.error("[Report] Failed to fetch departments:", err);
      }
    }

    if (plantId && (!systems || systems.length === 0)) {
      console.log("[Report] Fetching systems...");
      try {
        const sysRes = await dispatch(
          getSystemsByPlantId(Number(plantId))
        ).unwrap();
        if (sysRes.success && sysRes.data) {
          dispatch(setSystems(sysRes.data));
          fetchedSystems = sysRes.data;
          console.log(
            `[Report] Fetched ${sysRes.data.length} systems from API`
          );
        }
      } catch (err) {
        console.error("[Report] Failed to fetch systems:", err);
      }
    }

    if (plantId) {
      try {
        const deptRes = await dispatch(
          getDepartmentsByPlantId(Number(plantId))
        ).unwrap();
        if (deptRes.success && deptRes.data) {
          dispatch(setDepartments(deptRes.data));
          fetchedDepartments = deptRes.data;
        }
      } catch (err) {
        console.error("[Report] Failed to re-fetch departments:", err);
      }

      try {
        const sysRes = await dispatch(
          getSystemsByPlantId(Number(plantId))
        ).unwrap();
        if (sysRes.success && sysRes.data) {
          dispatch(setSystems(sysRes.data));
          fetchedSystems = sysRes.data;
        }
      } catch (err) {
        console.error("[Report] Failed to re-fetch systems:", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const allDepartments =
      fetchedDepartments.length > 0 ? fetchedDepartments : departments || [];
    const allSystems =
      fetchedSystems.length > 0 ? fetchedSystems : systems || [];

    let departmentsToCapture = allDepartments.filter(
      (d: DepartmentResult) => Number(d.plant_id) === plantIdNum
    );
    let systemsToCapture = allSystems.filter(
      (s: SystemResult) => Number(s.plant_id) === plantIdNum
    );

    if (selectedSections.department && selectedDepartmentIds.size > 0) {
      departmentsToCapture = departmentsToCapture.filter((d) =>
        selectedDepartmentIds.has(Number(d.department_id))
      );
    }
    if (selectedSections.system && selectedSystemIds.size > 0) {
      systemsToCapture = systemsToCapture.filter((s) =>
        selectedSystemIds.has(Number(s.system_id))
      );
    }

    try {
      const departmentCount = selectedSections.department
        ? departmentsToCapture.length
        : 0;
      const systemCount = selectedSections.system ? systemsToCapture.length : 0;
      const totalScreenshots =
        departmentCount +
        systemCount +
        (selectedSections.dashboard ? 1 : 0) +
        (selectedSections.plantDiagram ? 1 : 0);

      const updateProgress = (step: number, status: string) => {
        const percentage = Math.min(
          95,
          Math.round((step / totalScreenshots) * 90)
        );
        setReportProgress((prev) => ({
          percentage,
          timeRemaining: prev.timeRemaining,
          status,
        }));
      };

      updateProgress(0, "Preparing report data...");

      const dashboardScreenshot = selectedSections.dashboard
        ? await (async () => {
            updateProgress(1, "Capturing dashboard screenshot...");
            return await captureDashboardScreenshot(
              dashboardRef as React.RefObject<HTMLDivElement>
            )
              .catch((error) => {
                console.error("Failed to capture dashboard screenshot:", error);
                return null;
              })
              .then((result) => {
                return new Promise<string | null>((resolve) => {
                  setTimeout(() => resolve(result), 200);
                });
              });
          })()
        : null;

      const plantDiagramScreenshot = selectedSections.plantDiagram
        ? await (async () => {
            updateProgress(
              selectedSections.dashboard ? 2 : 1,
              "Capturing plant diagram..."
            );
            return await capturePlantDiagramScreenshot().catch((error) => {
              console.error(
                "Failed to capture plant diagram screenshot:",
                error
              );
              return null;
            });
          })()
        : null;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const departmentScreenshots =
        selectedSections.department && departmentsToCapture.length > 0
          ? await (async () => {
              const results = [];
              let deptIndex = 0;
              const baseStep =
                (selectedSections.dashboard ? 1 : 0) +
                (selectedSections.plantDiagram ? 1 : 0) +
                1;

              for (const dept of departmentsToCapture) {
                try {
                  updateProgress(
                    baseStep + deptIndex,
                    `Capturing depart ${deptIndex + 1}/${
                      departmentsToCapture.length
                    } (${dept.department_name || dept.department_id})...`
                  );

                  console.log(
                    `[Report] Capturing department ${dept.department_id} (${
                      dept.department_name
                    }) - ${deptIndex + 1}/${departmentsToCapture.length}`
                  );

                  const screenshot = await captureDepartmentScreenshot(
                    dept.department_id
                  );

                  console.log(
                    `[Report] Department ${dept.department_id} screenshot ${
                      screenshot ? "captured successfully" : "failed (null)"
                    }`
                  );

                  results.push({
                    id: dept.department_id,
                    name:
                      dept.department_name ||
                      `Department ${dept.department_id}`,
                    screenshot,
                  });
                  deptIndex++;
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                } catch (error) {
                  console.error(
                    `[Report] Failed to capture department ${dept.department_id} (${dept.department_name}) screenshot:`,
                    error
                  );
                  results.push({
                    id: dept.department_id,
                    name:
                      dept.department_name ||
                      `Department ${dept.department_id}`,
                    screenshot: null,
                  });
                  deptIndex++;
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              }

              console.log(
                `[Report] Department screenshots completed: ${
                  results.length
                } total, ${
                  results.filter((r) => r.screenshot).length
                } successful`
              );
              return results;
            })()
          : [];

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const systemScreenshots =
        selectedSections.system && systemsToCapture.length > 0
          ? await (async () => {
              const results = [];
              let sysIndex = 0;
              const baseStep =
                (selectedSections.dashboard ? 1 : 0) +
                (selectedSections.plantDiagram ? 1 : 0) +
                (selectedSections.department
                  ? departmentsToCapture.length
                  : 0) +
                1;

              for (const sys of systemsToCapture) {
                try {
                  updateProgress(
                    baseStep + sysIndex,
                    `Capturing system ${sysIndex + 1}/${
                      systemsToCapture.length
                    } (${sys.system_name || sys.system_id})...`
                  );

                  console.log(
                    `[Report] Capturing system ${sys.system_id} (${
                      sys.system_name
                    }) - ${sysIndex + 1}/${systemsToCapture.length}`
                  );

                  const screenshot = await captureSystemScreenshot(
                    sys.system_id
                  );

                  console.log(
                    `[Report] System ${sys.system_id} screenshot ${
                      screenshot ? "captured successfully" : "failed (null)"
                    }`
                  );

                  results.push({
                    id: sys.system_id,
                    name: sys.system_name || `System ${sys.system_id}`,
                    screenshot,
                  });
                  sysIndex++;
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                } catch (error) {
                  console.error(
                    `[Report] Failed to capture system ${sys.system_id} (${sys.system_name}) screenshot:`,
                    error
                  );
                  results.push({
                    id: sys.system_id,
                    name: sys.system_name || `System ${sys.system_id}`,
                    screenshot: null,
                  });
                  sysIndex++;
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              }

              console.log(
                `[Report] System screenshots completed: ${
                  results.length
                } total, ${
                  results.filter((r) => r.screenshot).length
                } successful`
              );
              return results;
            })()
          : [];

      const failedDeptScreenshots = departmentScreenshots.filter(
        (d) => !d.screenshot
      );
      const failedSysScreenshots = systemScreenshots.filter(
        (s) => !s.screenshot
      );

      const successfulDeptScreenshots =
        departmentScreenshots.length - failedDeptScreenshots.length;
      const successfulSysScreenshots =
        systemScreenshots.length - failedSysScreenshots.length;

      console.log(
        `[Report] Screenshot summary - Departments: ${successfulDeptScreenshots}/${departmentScreenshots.length} successful, Systems: ${successfulSysScreenshots}/${systemScreenshots.length} successful`
      );

      if (failedDeptScreenshots.length > 0) {
        const failedNames = failedDeptScreenshots
          .map((d) => d.name || `ID ${d.id}`)
          .join(", ");
        console.warn(
          `[Report] Failed to capture ${failedDeptScreenshots.length} department screenshot(s): ${failedNames}`
        );
      }
      if (failedSysScreenshots.length > 0) {
        const failedNames = failedSysScreenshots
          .map((s) => s.name || `ID ${s.id}`)
          .join(", ");
        console.warn(
          `[Report] Failed to capture ${failedSysScreenshots.length} system screenshot(s): ${failedNames}`
        );
      }

      const screenshots = {
        dashboard: dashboardScreenshot,
        plantDiagram: plantDiagramScreenshot,
        systems: systemScreenshots.map((s) => ({
          systemId: s.id,
          systemName: s.name,
          screenshot: s.screenshot,
        })),
        departments: departmentScreenshots.map((d) => ({
          departmentId: d.id,
          departmentName: d.name,
          screenshot: d.screenshot,
        })),
      };

      const { wrapper, baseHref } = createReportWrapper();

      const plantDepartments =
        departments?.filter((d) => d.plant_id === plantIdNum) || [];
      const plantSystems =
        systems?.filter((s) => s.plant_id === plantIdNum) || [];
      const plantDevices =
        devices?.filter((d) => d.plant_id === plantIdNum) || [];

      const organizationName =
        plantDepartments[0]?.organization_name ||
        plantSystems[0]?.organization_name ||
        departments?.[0]?.organization_name ||
        systems?.[0]?.organization_name ||
        "";
      const plantName =
        plantDepartments[0]?.plant_name ||
        plantSystems[0]?.plant_name ||
        plantDevices[0]?.plant_name ||
        departments?.[0]?.plant_name ||
        systems?.[0]?.plant_name ||
        devices?.[0]?.plant_name ||
        "";

      const organizationInfo: OrganizationInfo = {
        organizationName: organizationName || "",
        organizationLogo: devices?.[0]?.logo || "",
        organizationIntroduction: devices?.[0]?.introduction || "",
        organizationGovernance: devices?.[0]?.governance || "",
        plantName: plantName || "",
      };

      updateDateElement(wrapper, currentTime);
      updateOrganizationInfo(wrapper, organizationInfo);

      setupScreenshotSections(wrapper, selectedSections, screenshots, {
        dashboard: reportDashboardImg,
        plantDiagram: reportDaigramImg,
        system: reportSystemImg,
        department: reportDepartmentImg,
      });

      const reportData: ReportData = {
        totalIn: 0,
        totalOut: 0,
        totalBalance: 0,
        totalStock:
          storageBalanceData?.find((d) => d.name === "Total Stock")?.value || 0,
        availableCapacity:
          storageBalanceData?.find((d) => d.name === "Available Capacity")
            ?.value || 0,
        totalCapacity:
          (storageBalanceData?.find((d) => d.name === "Total Stock")?.value ||
            0) +
          (storageBalanceData?.find((d) => d.name === "Available Capacity")
            ?.value || 0),
        flowIn: aggregatedWaterBalanceData?.flow_in || 0,
        flowOut: aggregatedWaterBalanceData?.flow_out || 0,
        percolation: aggregatedWaterBalanceData?.percolation || 0,
        evaporation: aggregatedWaterBalanceData?.evaporation || 0,
        consumption: aggregatedWaterBalanceData?.consumption || 0,
        wastage: aggregatedWaterBalanceData?.wastage || 0,
        regeneration: aggregatedWaterBalanceData?.regeneration || 0,
        reuse: aggregatedWaterBalanceData?.reuse || 0,
        rainfall: aggregatedWaterBalanceData?.rainfall || 0,
        netBalance: totalNetBalance,
      };

      setupCharts(
        wrapper,
        reportData,
        waterNeutralityIndexData || [],
        selectedSections
      );

      setupWaterBalanceSection(wrapper, reportData, selectedSections);

      setupWaterNeutralityIndexSection(
        wrapper,
        waterNeutralityIndexData || [],
        waterNeutralityIndexValue,
        selectedSections,
        devices?.[0]?.unit || "Ltr."
      );

      setupStorageSection(wrapper, reportData, selectedSections);

      setupDetailedReportSection(
        wrapper,
        reportData,
        waterNeutralityIndexValue,
        selectedSections
      );

      const imgs = Array.from(wrapper.querySelectorAll("img"));
      const imagePromises = imgs.map(async (img) => {
        const src = img.getAttribute("src");
        if (!src || src.startsWith("data:")) return;

        let absoluteUrl: string;
        try {
          absoluteUrl = new URL(src, baseHref).toString();
        } catch {
          return;
        }

        try {
          const resp = await fetch(absoluteUrl, { mode: "cors" });
          if (!resp.ok) return;
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.setAttribute("src", dataUrl);
          img.removeAttribute("crossorigin");
        } catch (error) {
          console.warn(`Failed to process image ${src}:`, error);
        }
      });

      updateProgress(totalScreenshots, "Processing images...");
      await Promise.all(imagePromises);

      updateProgress(totalScreenshots + 1, "Generating report...");
      const htmlToSave = wrapper.outerHTML;
      const blob = new Blob([htmlToSave], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedPlantName = plantName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const fileName = sanitizedPlantName
        ? `water-balance-report-${sanitizedPlantName}.html`
        : "water-balance-report.html";
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);

      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            if (!a || !a.parentNode) {
              return;
            }

            if (a.parentNode.contains(a)) {
              a.parentNode.removeChild(a);
            } else if (document.body.contains(a)) {
              document.body.removeChild(a);
            } else {
              try {
                a.remove();
              } catch (error) {
                if (process.env.NODE_ENV === "development") {
                  console.warn("Error removing download link:", error);
                }
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn("Error removing download link:", error);
            }
          }
        }, 200);
      });

      setReportProgress({
        percentage: 100,
        timeRemaining: 0,
        status: "Report generated successfully!",
      });
    } catch (error: unknown) {
      console.error("[Report] Error generating report:", error);
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      Error(`Failed to generate report: ${errorMessage}`);
      setReportProgress({
        percentage: 0,
        timeRemaining: 0,
        status: "Report generation failed. Please try again.",
      });
    } finally {
      setIsDownloadingReport(false);
      localStorage.removeItem("isDownloadingReport");
      window.dispatchEvent(new CustomEvent("reportDownloadComplete"));
    }
  };

  const hasWaterNeutralityDataArray = useMemo(() => {
    return (
      waterNeutralityIndexData &&
      waterNeutralityIndexData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices &&
      devices.length > 0
    );
  }, [waterNeutralityIndexData, aggregatedWaterBalanceData, devices]);

  const hasWaterBalanceDataArray = useMemo(() => {
    return (
      waterBalanceData &&
      waterBalanceData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices &&
      devices.length > 0
    );
  }, [waterBalanceData, aggregatedWaterBalanceData, devices]);

  const hasStorageDataArray = useMemo(() => {
    return (
      storageBalanceData &&
      storageBalanceData.length > 0 &&
      devices &&
      devices.length > 0
    );
  }, [storageBalanceData, devices]);

  return (
    <div ref={dashboardRef} className="flex flex-col w-full h-full gap-3">
      <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row w-full sticky top-0 z-10 bg-input-bg flex-wrap">
        <div className="flex items-center justify-between flex-col md:flex-row gap-3">
          {userRole === "org_admin" && (
            <div className="flex items-center gap-3 flex-col md:flex-row">
              <nav className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-secondary px-2 py-1.5 rounded-lg w-fit whitespace-nowrap">
                <button
                  onClick={() => {
                    const plantId = getCurrentPlantId();
                    if (plantId) {
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
                <span className="text-text-primary font-normal font-roboto">
                  Plant
                </span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-normal font-roboto">
                  {plantName}
                </span>
              </nav>
            </div>
          )}
        </div>

        {isDownloadingReport && (
          <div
            data-exclude-from-screenshot="true"
            className="flex flex-col gap-1 px-4 py-1 bg-primary text-text-primary border border-border-primary rounded-md shadow-md min-w-[250px] w-fit"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-roboto font-normal text-status-info">
                {reportProgress.percentage}%
              </span>
              <span className="text-sm font-roboto font-normal text-text-secondary flex-1">
                {reportProgress.status}
              </span>
            </div>
            <div className="w-full h-2 bg-status-info/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r rounded-full transition-all duration-300 ease-out"
                style={{ width: `${reportProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

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
              if (!plantId) {
                Warning("Please select a plant to fetch data");
                return;
              }
              fetchPlantReport();
              fetchDepartmentReports();
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
            title="Get Data"
          >
            <FileTextIcon className="w-5 h-5" />
            Get Data
          </button>
        </div>
        <DownloadReportDropdown
          isDownloadingReport={isDownloadingReport}
          isDownloadDropdownOpen={isDownloadDropdownOpen}
          setIsDownloadDropdownOpen={setIsDownloadDropdownOpen}
          reportProgress={reportProgress}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
          selectedDepartmentIds={selectedDepartmentIds}
          setSelectedDepartmentIds={setSelectedDepartmentIds}
          selectedSystemIds={selectedSystemIds}
          setSelectedSystemIds={setSelectedSystemIds}
          isDepartmentDropdownOpen={isDepartmentDropdownOpen}
          setIsDepartmentDropdownOpen={setIsDepartmentDropdownOpen}
          isSystemDropdownOpen={isSystemDropdownOpen}
          setIsSystemDropdownOpen={setIsSystemDropdownOpen}
          departments={plantDepartments}
          systems={plantSystems}
          plantIdNum={plantIdNum}
          downloadDropdownRef={downloadDropdownRef}
          departmentDropdownRef={departmentDropdownRef}
          systemDropdownRef={systemDropdownRef}
          departmentChevronRef={departmentChevronRef}
          systemChevronRef={systemChevronRef}
          handleDownloadReport={handleDownloadReport}
        />
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
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
            neutralityIndexValue={
              waterNeutralityIndexValue as unknown as number
            }
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

        <WaterBalanceSection
          isLoading={isLoading}
          lineChartRef={lineChartRef}
          plantReportNameWise={
            aggregatedWaterBalanceData as Record<string, number> | null
          }
          totalNetBalance={totalNetBalance}
          unit={devices[0]?.unit || ""}
          dateSelectionType={
            dateSelectionType as "daily" | "monthly" | "yearly" | "custom"
          }
        />

        <DepartmentBalanceCards
          isLoading={isLoading || isLoadingDepartments}
          departmentBalances={departmentBalances}
          departments={departments}
          organizationId={organizationId}
          plantId={plantId}
        />
      </div>

      <iframe
        src={getCurrentPlantId() ? `/plant/${getCurrentPlantId()}` : undefined}
        className="hidden"
        style={{ display: "none" }}
        title="Dashboard Preview"
        aria-hidden="true"
      />
    </div>
  );
};

export default Dashboard;
