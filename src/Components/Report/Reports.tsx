import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown, DownloadIcon, FileTextIcon, Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import DateSelection from "../Dashboard/DateSelection";
import { getDepartmentsByPlantId } from "../../../store/departmentSlice";
import { getSystemsByPlantId } from "../../../store/systemSlice";
import type { PlantReportData } from "../../../model/plant-report.interface";
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
          setPlantReport(res.data.report);
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
  const allReportEntries = plantReport ? Object.entries(plantReport) : [];

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
                  reportEntries.map(([dateKey, data], index) => (
                    <tr
                      key={dateKey}
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
                          className="px-4 py-3 text-sm text-text-secondary font-roboto whitespace-nowrap"
                        >
                          {formatNumber(
                            (data as unknown as Record<string, number | null>)[
                              key
                            ],
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
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
