import {
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronDown, DownloadIcon, FileTextIcon, Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import DateSelection from "../Dashboard/DateSelection";
import { getDepartmentsByPlantId } from "../../../store/departmentSlice";
import { getSystemsByPlantId } from "../../../store/systemSlice";
import type { PlantReportData } from "../../../model/plant-report.interface";
import type {
  AllDevice,
  Logs,
  LogItemData,
} from "../../../model/report.interface";
import {
  getPlantReport,
  getPlantsByUserId,
  setPlants,
} from "../../../store/plantSlice";
import { Error, Warning } from "../../utils/toast";
import Pagination from "../Pagination";
import { formatDateForCSV, getDateRange, downloadCSV } from "../../utils/utils";

const Reports = () => {
  const dispatch = useAppDispatch();
  const { plants } = useAppSelector((state) => state.plant);
  const { departments } = useAppSelector((state) => state.department);
  const { systems } = useAppSelector((state) => state.system);

  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const [dateSelectionType, setDateSelectionType] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [dailyDate, setDailyDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [yearlyDate, setYearlyDate] = useState(
    new Date().getFullYear().toString(),
  );
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
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
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);

  const plantDropdownRef = useRef<HTMLDivElement>(null);
  const plantButtonRef = useRef<HTMLButtonElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const departmentButtonRef = useRef<HTMLButtonElement>(null);
  const systemDropdownRef = useRef<HTMLDivElement>(null);
  const systemButtonRef = useRef<HTMLButtonElement>(null);
  const [plantReport, setPlantReport] = useState<PlantReportData | null>(null);
  /** Device list and logs for drill-down; set from API when available */
  const [reportAllDevices, setReportAllDevices] = useState<AllDevice[]>([]);
  const [reportLogs, setReportLogs] = useState<Logs | null>(null);
  /** Which cell is expanded: row date + column report key */
  const [expandedCell, setExpandedCell] = useState<{
    dateKey: string;
    reportKey: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const totalItems = useMemo(() => {
    if (!plantReport) return 0;
    return Object.values(plantReport).length;
  }, [plantReport]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalItems, rowsPerPage]);

  const selectedRows = useMemo(() => {
    if (!plantReport) return 0;
    return Object.values(plantReport).length;
  }, [plantReport]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setCurrentPage(1);
  };

  const fetchPlantReport = useCallback(() => {
    if (!selectedPlantId) return;
    setIsLoading(true);

    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate,
    );

    let departmentId = 0;
    let systemId = 0;

    if (selectedSystemId) {
      systemId = selectedSystemId;
      departmentId = 0;
    } else if (selectedDepartmentId) {
      departmentId = selectedDepartmentId;
      systemId = 0;
    } else {
      departmentId = 0;
      systemId = 0;
    }

    dispatch(
      getPlantReport({
        plant_id: selectedPlantId,
        department_id: departmentId,
        system_id: systemId,
        from_date: fromDate,
        to_date: toDate,
        duration: durationType,
      }),
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          const data = res.data as {
            report: PlantReportData;
            allDevices?: AllDevice[];
            logs?: Logs;
          };
          setPlantReport(data.report);
          setReportAllDevices(data.allDevices ?? []);
          setReportLogs(data.logs ?? null);
          setExpandedCell(null);
          setCurrentPage(1);
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
    selectedPlantId,
    selectedDepartmentId,
    selectedSystemId,
    durationType,
    dispatch,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const fetchPlants = useCallback(() => {
    dispatch(getPlantsByUserId())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setPlants(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get plants");
      });
  }, [dispatch]);

  useEffect(() => {
    if (plants.length === 0) {
      fetchPlants();
    }
  }, [plants.length, fetchPlants]);

  const filteredDepartments = selectedPlantId
    ? departments.filter((dept) => dept.plant_id === selectedPlantId)
    : [];

  const filteredSystems = selectedDepartmentId
    ? systems.filter((sys) => sys.department_id === selectedDepartmentId)
    : [];

  const selectedPlant = plants.find((p) => p.plant_id === selectedPlantId);
  const selectedDepartment = departments.find(
    (d) => d.department_id === selectedDepartmentId,
  );
  const selectedSystem = systems.find((s) => s.system_id === selectedSystemId);

  useEffect(() => {
    if (selectedPlantId) {
      dispatch(getDepartmentsByPlantId(selectedPlantId));
    }
  }, [selectedPlantId, dispatch]);

  useEffect(() => {
    if (selectedPlantId) {
      dispatch(getSystemsByPlantId(selectedPlantId));
    }
  }, [selectedPlantId, dispatch]);

  useEffect(() => {
    setSelectedDepartmentId(null);
    setSelectedSystemId(null);
  }, [selectedPlantId]);

  useEffect(() => {
    setSelectedSystemId(null);
  }, [selectedDepartmentId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        plantDropdownRef.current &&
        !plantDropdownRef.current.contains(event.target as Node) &&
        plantButtonRef.current &&
        !plantButtonRef.current.contains(event.target as Node)
      ) {
        setIsPlantDropdownOpen(false);
      }
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target as Node) &&
        departmentButtonRef.current &&
        !departmentButtonRef.current.contains(event.target as Node)
      ) {
        setIsDepartmentDropdownOpen(false);
      }
      if (
        systemDropdownRef.current &&
        !systemDropdownRef.current.contains(event.target as Node) &&
        systemButtonRef.current &&
        !systemButtonRef.current.contains(event.target as Node)
      ) {
        setIsSystemDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGetData = () => {
    if (!selectedPlantId) {
      Warning("Please select a plant to fetch data");
      return;
    }
    fetchPlantReport();
  };

  const handleDownloadCSV = () => {
    if (!plantReport || allReportEntries.length === 0) {
      Warning("No data available to download");
      return;
    }

    const csvData: Record<string, string | number>[] = [];

    allReportEntries.forEach(([dateKey, data]) => {
      const row: Record<string, string | number> = {
        "Date & Time": formatDateForCSV(dateKey),
      };
      reportKeys.forEach((key) => {
        const value = (data as unknown as Record<string, number | null>)[key];
        row[formatHeaderName(key)] =
          value !== null && value !== undefined ? value : 0;
      });
      csvData.push(row);
    });

    if (Object.keys(columnTotals).length > 0) {
      const totalsRow: Record<string, string | number> = {
        "Date & Time": "Total",
      };
      reportKeys.forEach((key) => {
        totalsRow[formatHeaderName(key)] = columnTotals[key] || 0;
      });
      csvData.push(totalsRow);
    }

    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate,
    );
    const plantName = selectedPlant?.plant_name || "Plant";
    const fromDateStr = fromDate.split(" ")[0].replace(/-/g, "");
    const toDateStr = toDate.split(" ")[0].replace(/-/g, "");
    const fileName = `Water_Balance_Report_${plantName}_${fromDateStr}_${toDateStr}`;

    downloadCSV(csvData, fileName);
  };

  const getReportKeys = () => {
    if (!plantReport) return [];
    const firstEntry = Object.values(plantReport)[0];
    if (!firstEntry) return [];
    return Object.keys(firstEntry).filter(
      (key) =>
        key !== "Flow" && key !== "Storage" && key !== "Neutrality-Index",
    );
  };

  /** Map report column key to report_type_name style for matching logs (e.g. Flow_in -> "Flow In") */
  const reportKeyToTypeName = (reportKey: string) =>
    reportKey.replace(/_/g, " ").trim();

  /** Normalize report column key for flow detection: "Flow Out" / "Flow_out" -> "flow_out", "Flow In" / "Flow_in" -> "flow_in". */
  const normalizedFlowKey = (reportKey: string) =>
    reportKey.toLowerCase().replace(/\s+/g, "_").trim();

  /**
   * Check if device/log matches current plant/department/system filters.
   * Flow_in: plant_id wise → in_plant_id; department_id wise → in_department_id; system_id wise → in_system_id (and report_type_name = "Flow").
   * Flow_out: plant_id wise → out_plant_id; department_id wise → out_department_id; system_id wise → out_system_id (and report_type_name = "Flow").
   * Other columns: filter by in_* with fallback to device.plant_id/department_id/system_id.
   */
  const matchesSelection = useCallback(
    (device: AllDevice, reportKey: string): boolean => {
      const key = normalizedFlowKey(reportKey);
      const isFlowIn = key === "flow_in";
      const isFlowOut = key === "flow_out";

      let plantId: number | null | undefined;
      let deptId: number | null | undefined;
      let sysId: number | null | undefined;

      if (isFlowIn) {
        plantId = device.in_plant_id;
        deptId = device.in_department_id;
        sysId = device.in_system_id;
        // Flow_in: exclude null in_plant_id only when filtering by plant and NOT by department/system (e.g. device 164: in_department_id=33, in_plant_id=null — show when department 33 is selected).
        if (
          selectedPlantId != null &&
          plantId == null &&
          selectedDepartmentId == null &&
          selectedSystemId == null
        )
          return false;
      } else if (isFlowOut) {
        plantId = device.out_plant_id;
        deptId = device.out_department_id;
        sysId = device.out_system_id;
      } else {
        plantId = device.in_plant_id ?? device.plant_id;
        deptId = device.in_department_id ?? device.department_id;
        sysId = device.in_system_id ?? device.system_id;
      }

      // Compare as numbers so string "5" from API matches selected 5.
      // Department/system: require device to have that level set AND match.
      const numPlant = plantId != null ? Number(plantId) : undefined;
      const numDept = deptId != null ? Number(deptId) : undefined;
      const numSys = sysId != null ? Number(sysId) : undefined;
      if (
        selectedPlantId != null &&
        numPlant !== undefined &&
        numPlant !== selectedPlantId
      )
        return false;
      // When filtering by system (flow_in/flow_out), allow devices with null department if system matches (e.g. device 8: out_system_id=4, out_department_id=null should show when system 4 is selected).
      const allowNullDeptWhenSystemSelected =
        (isFlowIn || isFlowOut) &&
        selectedSystemId != null &&
        numSys !== undefined &&
        numSys === selectedSystemId &&
        numDept === undefined;
      if (
        selectedDepartmentId != null &&
        (numDept === undefined || numDept !== selectedDepartmentId) &&
        !allowNullDeptWhenSystemSelected
      )
        return false;
      if (
        selectedSystemId != null &&
        (numSys === undefined || numSys !== selectedSystemId)
      )
        return false;
      return true;
    },
    [selectedPlantId, selectedDepartmentId, selectedSystemId],
  );

  /** Get devices and their log values for a given date and report column (for expanded drill-down). Filters by selected plant/department/system: Flow_in uses in_*, Flow_out uses out_*. */
  const getFilteredDeviceLogs = useCallback(
    (dateKey: string, reportKey: string) => {
      const dateLogs = reportLogs?.[dateKey];
      if (!dateLogs || typeof dateLogs !== "object") return [];

      const entries: { device: AllDevice; log: LogItemData }[] = [];
      for (const deviceIdStr of Object.keys(dateLogs)) {
        const logEntry = (dateLogs as Record<string, LogItemData>)[deviceIdStr];
        if (!logEntry || typeof logEntry !== "object") continue;
        const logTypeName = (logEntry.report_type_name ?? "").trim();
        let typeMatch: boolean;
        const flowKey = normalizedFlowKey(reportKey);
        if (flowKey === "flow_in" || flowKey === "flow_out") {
          // Flow_in: in_plant_id / in_department_id / in_system_id + report_type_name = "Flow"
          // Flow_out: out_plant_id / out_department_id / out_system_id + report_type_name = "Flow"
          typeMatch = logTypeName === "Flow";
          // Flow_in with null in_plant_id is allowed when filtering by department/system; matchesSelection excludes only when plant is selected.
        } else {
          const typeName = reportKeyToTypeName(reportKey);
          typeMatch =
            logTypeName === typeName ||
            logTypeName.replace(/\s+/g, " ") === typeName;
        }
        if (!typeMatch) continue;

        const device = reportAllDevices.find(
          (d) => d.device_id === Number(deviceIdStr),
        );
        const resolvedDevice: AllDevice = device
          ? device
          : ({
              device_id: logEntry.device_id,
              device_name: `Device ${logEntry.device_id}`,
              report_type_name: logEntry.report_type_name,
              in_plant_id: logEntry.plant_connection?.in_plant_id,
              out_plant_id: logEntry.plant_connection?.out_plant_id,
              in_department_id:
                logEntry.department_connection?.in_department_id,
              out_department_id:
                logEntry.department_connection?.out_department_id,
              in_system_id: logEntry.system_connection?.in_system_id,
              out_system_id: logEntry.system_connection?.out_system_id,
              plant_id:
                logEntry.plant_connection?.in_plant_id ??
                logEntry.plant_connection?.plant_id,
              department_id:
                logEntry.department_connection?.in_department_id ??
                logEntry.department_connection?.department_id,
              system_id:
                logEntry.system_connection?.in_system_id ??
                logEntry.system_connection?.system_id,
            } as AllDevice);

        if (matchesSelection(resolvedDevice, reportKey)) {
          entries.push({ device: resolvedDevice, log: logEntry });
        }
      }
      return entries;
    },
    [reportLogs, reportAllDevices, matchesSelection],
  );

  const handleCellClick = (dateKey: string, reportKey: string) => {
    setExpandedCell((prev) =>
      prev?.dateKey === dateKey && prev?.reportKey === reportKey
        ? null
        : { dateKey, reportKey },
    );
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const formatHeaderName = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const reportKeys = getReportKeys();
  const allReportEntries = useMemo(
    () => (plantReport ? Object.entries(plantReport) : []),
    [plantReport],
  );

  const reportEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return allReportEntries.slice(startIndex, endIndex);
  }, [allReportEntries, currentPage, rowsPerPage]);

  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    if (plantReport && reportKeys.length > 0) {
      reportKeys.forEach((key) => {
        totals[key] = 0;
        Object.values(plantReport).forEach((data) => {
          const value = (data as unknown as Record<string, number | null>)[key];
          if (typeof value === "number" && !isNaN(value)) {
            totals[key] += value;
          }
        });
      });
    }

    return totals;
  }, [plantReport, reportKeys]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-text-primary font-roboto">
          Water Balance Report
        </h1>
      </div>

      <div className="flex items-center flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-normal text-text-primary font-roboto">
              Report Type & Date Selection
            </label>
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
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-normal text-text-primary font-roboto">
            Plant
          </label>
          <div className="relative">
            <button
              ref={plantButtonRef}
              type="button"
              onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
              className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info flex items-center justify-between"
            >
              <span className="truncate">
                {selectedPlant ? selectedPlant.plant_name : "Select Plant"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${
                  isPlantDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isPlantDropdownOpen && (
              <div
                ref={plantDropdownRef}
                className="absolute top-full left-0 mt-1 w-40 bg-secondary border border-border-primary rounded-md shadow-lg z-21 max-h-60 overflow-y-auto"
              >
                {plants.length === 0 ? (
                  <div className="px-3 py-2 text-text-secondary text-sm font-roboto">
                    No plants available
                  </div>
                ) : (
                  plants.map((plant) => (
                    <button
                      key={plant.plant_id}
                      type="button"
                      onClick={() => {
                        setSelectedPlantId(plant.plant_id);
                        setIsPlantDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg font-roboto ${
                        selectedPlantId === plant.plant_id ? "bg-input-bg" : ""
                      }`}
                    >
                      {plant.plant_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Department Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-normal text-text-primary font-roboto">
            Department
          </label>
          <div className="relative">
            <button
              ref={departmentButtonRef}
              type="button"
              onClick={() =>
                setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
              }
              disabled={!selectedPlantId}
              className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {selectedDepartment
                  ? selectedDepartment.department_name
                  : "Select Department"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${
                  isDepartmentDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDepartmentDropdownOpen && selectedPlantId && (
              <div
                ref={departmentDropdownRef}
                className="absolute top-full left-0 mt-1 w-40 bg-secondary border border-border-primary rounded-md shadow-lg z-21 max-h-60 overflow-y-auto"
              >
                {filteredDepartments.length === 0 ? (
                  <div className="px-3 py-2 text-text-secondary text-sm font-roboto">
                    No departments available
                  </div>
                ) : (
                  filteredDepartments.map((department) => (
                    <button
                      key={department.department_id}
                      type="button"
                      onClick={() => {
                        setSelectedDepartmentId(department.department_id);
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg font-roboto ${
                        selectedDepartmentId === department.department_id
                          ? "bg-input-bg"
                          : ""
                      }`}
                    >
                      {department.department_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-normal text-text-primary font-roboto">
            System
          </label>
          <div className="relative">
            <button
              ref={systemButtonRef}
              type="button"
              onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
              disabled={!selectedDepartmentId}
              className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {selectedSystem ? selectedSystem.system_name : "Select System"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${
                  isSystemDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isSystemDropdownOpen && selectedDepartmentId && (
              <div
                ref={systemDropdownRef}
                className="absolute top-full left-0 mt-1 w-40 bg-secondary border border-border-primary rounded-md shadow-lg z-21 max-h-60 overflow-y-auto"
              >
                {filteredSystems.length === 0 ? (
                  <div className="px-3 py-2 text-text-secondary text-sm font-roboto">
                    No systems available
                  </div>
                ) : (
                  filteredSystems.map((system) => (
                    <button
                      key={system.system_id}
                      type="button"
                      onClick={() => {
                        setSelectedSystemId(system.system_id);
                        setIsSystemDropdownOpen(false);
                      }}
                      className={`w-40 px-3 py-2 text-left text-text-primary hover:bg-input-bg font-roboto ${
                        selectedSystemId === system.system_id
                          ? "bg-input-bg"
                          : ""
                      }`}
                    >
                      {system.system_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Get Data Button */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-normal text-text-secondary font-roboto opacity-0">
            Action
          </label>
          <button
            onClick={handleGetData}
            className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
            title="Get Data"
          >
            <FileTextIcon className="w-5 h-5" />
            Get Data
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-normal text-text-secondary font-roboto opacity-0">
            Download
          </label>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-text-primary rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
            title="Download CSV"
          >
            <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Report Data Table */}
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center py-8 text-center bg-primary rounded-lg border border-border-primary">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
          <div className="table-scrollbar overflow-x-auto overflow-y-auto h-[calc(100vh-335px)]">
            <table
              className={`w-full border-collapse ${
                reportEntries.length > 0 ? "h-auto" : "h-full"
              }`}
            >
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-20">
                <tr className="bg-secondary border-b border-border-primary">
                  {reportEntries.length > 0 && (
                    <th className="px-4 py-3 text-left text-sm font-normal text-text-primary font-roboto sticky left-0 bg-secondary z-10 border-r border-border-primary">
                      Date & Time
                    </th>
                  )}
                  {reportKeys.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-sm font-normal text-text-primary font-roboto whitespace-nowrap"
                    >
                      {formatHeaderName(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`${reportEntries.length > 0 ? "h-auto" : "h-full"}`}
              >
                {reportEntries.length > 0 ? (
                  reportEntries.map(([dateKey, data], index) => {
                    const isExpanded =
                      expandedCell?.dateKey === dateKey && expandedCell != null;
                    const filteredLogs = isExpanded
                      ? getFilteredDeviceLogs(
                          dateKey,
                          expandedCell?.reportKey ?? "",
                        )
                      : [];
                    return (
                      <Fragment key={dateKey}>
                        <tr
                          className={`border-b border-border-primary ${
                            index % 2 === 0 ? "bg-primary" : "bg-secondary/30"
                          } hover:bg-input-bg transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm text-text-primary font-roboto sticky left-0 bg-inherit z-10 border-r border-border-primary whitespace-nowrap">
                            {formatDateForCSV(dateKey)}
                          </td>
                          {reportKeys.map((key) => (
                            <td
                              key={key}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleCellClick(dateKey, key)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleCellClick(dateKey, key);
                                }
                              }}
                              className="px-4 py-3 text-sm text-text-secondary font-roboto whitespace-nowrap cursor-pointer hover:bg-status-info/10 focus:outline-none focus:ring-1 focus:ring-status-info rounded"
                            >
                              {formatNumber(
                                (
                                  data as unknown as Record<
                                    string,
                                    number | null
                                  >
                                )[key],
                              )}
                            </td>
                          ))}
                        </tr>
                        {isExpanded && (
                          <tr
                            key={`${dateKey}-expand`}
                            className="bg-secondary/50 border-b border-border-primary"
                          >
                            <td
                              colSpan={reportKeys.length + 1}
                              className="px-4 py-3 align-top"
                            >
                              <div className="rounded border border-border-primary bg-primary overflow-hidden">
                                <div className="px-3 py-2 text-xs font-medium text-text-primary font-roboto border-b border-border-primary bg-secondary/50">
                                  Device breakdown for{" "}
                                  {formatHeaderName(
                                    expandedCell?.reportKey ?? "",
                                  )}{" "}
                                  on {formatDateForCSV(dateKey)}
                                </div>
                                {filteredLogs.length > 0 ? (
                                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                                    <table className="w-full text-sm font-roboto border-collapse">
                                      <thead>
                                        <tr className="bg-secondary/70 text-left text-text-primary">
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Sr No.
                                          </th>
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Device
                                          </th>
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Report type
                                          </th>
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Flow
                                          </th>
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Avg
                                          </th>
                                          <th className="px-3 py-2 border-b border-border-primary whitespace-nowrap">
                                            Min / Max
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredLogs.map(
                                          ({ device, log }, index) => (
                                            <tr
                                              key={`${device.device_id}-${dateKey}`}
                                              className="border-b border-border-primary/50 text-text-secondary"
                                            >
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {index +
                                                  1 +
                                                  (currentPage - 1) *
                                                    rowsPerPage}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap border-b border-border-primary/50">
                                                {device.device_name}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {log.report_type_name}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {formatNumber(
                                                  Number(log.flow) || null,
                                                )}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {formatNumber(
                                                  Number(log.avg) || null,
                                                )}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {formatNumber(
                                                  Number(log.min) || null,
                                                )}{" "}
                                                /{" "}
                                                {formatNumber(
                                                  Number(log.max) || null,
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="px-3 py-4 text-sm text-text-secondary font-roboto">
                                    No device-level data available for this
                                    cell. Ensure the report API returns
                                    allDevices and logs for drill-down.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr className="h-full">
                    <td
                      colSpan={reportKeys.length + 1}
                      className="px-4 py-12 h-full flex items-center justify-center text-sm text-text-secondary font-roboto whitespace-nowrap text-center"
                    >
                      Select filters and click "Get Data" to view report.
                    </td>
                  </tr>
                )}
              </tbody>
              {reportEntries.length > 0 &&
                Object.keys(columnTotals).length > 0 && (
                  <tfoot className="bg-secondary/50 border-t-2 border-border-primary sticky bottom-0 z-10">
                    <tr className="bg-secondary/80">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary font-roboto sticky left-0 bg-secondary/80 z-10 border-r border-border-primary whitespace-nowrap">
                        Total
                      </td>
                      {reportKeys.map((key) => (
                        <td
                          key={key}
                          className="px-4 py-3 text-sm font-medium text-text-primary font-roboto whitespace-nowrap"
                        >
                          {formatNumber(columnTotals[key])}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={totalItems}
              selectedRows={selectedRows}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
