import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  BarChart3Icon,
  BarChart3,
  Droplets,
  ChevronRight,
  ChevronsLeft,
  MapPinIcon,
  Monitor,
  Loader2,
  DownloadIcon,
  Building2,
  Factory,
} from "lucide-react";
import MapComponent from "./MapComponent";
import WaterGauge from "./WaterGauge";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getDeviceById } from "../../../store/deviceSlice";
import {
  getFmCustomReport,
  getDeviceFmLogs,
} from "../../../store/fmDeviceSlice";
import { Error } from "../../utils/toast";
import type { FmDeviceResultItem } from "../../../model/fm-device.interface";
import { downloadCSV, flowUnit, formatDateForCSV } from "../../utils/utils";
import NoDataFound from "../NoDataFound";
import type { SingleDeviceResult } from "../../../model/single-device.interface";
import Pagination from "../Pagination";
import { getCurrentPlantId } from "../../utils/plantUtils";
import { useLocation } from "react-router-dom";

const FmDevice = () => {
  const { device_id } = useParams<{ device_id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const organizationId = localStorage.getItem("organizationId");
  const systemId = localStorage.getItem("systemId");
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const defaultCustomFrom = sevenDaysAgo.toISOString().split("T")[0];
  const defaultCustomTo = now.toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<"panel" | "reports">(
    (searchParams.get("tab") as "panel" | "reports") || "panel"
  );
  const [selectedReport, setSelectedReport] = useState<
    "none" | "runTime" | "customReport"
  >(
    (searchParams.get("report") as "none" | "runTime" | "customReport") ||
      "none"
  );

  const [deviceData, setDeviceData] = useState<SingleDeviceResult>(
    {} as SingleDeviceResult
  );

  const [runTimeDate, setRunTimeDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [runTimeData, setRunTimeData] = useState<FmDeviceResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [customReportFromDate, setCustomReportFromDate] =
    useState<string>(defaultCustomFrom);
  const [customReportToDate, setCustomReportToDate] =
    useState<string>(defaultCustomTo);
  const [customReportData, setCustomReportData] = useState<
    FmDeviceResultItem[]
  >([]);
  const [customReportDuration, setCustomReportDuration] = useState<
    "15min" | "1hour" | "1day"
  >("15min");
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { user } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId())
  )?.role;

  const totalItems = useMemo(() => {
    if (selectedReport === "runTime") {
      return runTimeData.length;
    } else if (selectedReport === "customReport") {
      return customReportData.length;
    }
    return 0;
  }, [runTimeData, selectedReport, customReportData]);

  const selectedRows = useMemo(() => {
    let currentData: FmDeviceResultItem[] = [];
    if (selectedReport === "runTime") {
      currentData = runTimeData;
    } else if (selectedReport === "customReport") {
      currentData = customReportData;
    }

    const paginatedData = currentData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
    return paginatedData.length;
  }, [runTimeData, customReportData, selectedReport, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalItems, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const handlePaginatedData = (data: FmDeviceResultItem[]) => {
    return data.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setCurrentPage(1);
  };

  const fetchDeviceData = useCallback(() => {
    setIsPanelLoading(true);
    dispatch(getDeviceById(Number(device_id)))
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceData(res.data);
        } else {
          Error(res.message || "Failed to get device data");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get device data");
      })
      .finally(() => {
        setIsPanelLoading(false);
      });
  }, [device_id, dispatch]);

  useEffect(() => {
    if (device_id) {
      fetchDeviceData();
    }
  }, [device_id, fetchDeviceData]);

  const fetchRunTimeData = useCallback(() => {
    if (!runTimeDate) {
      Error("Please select a date");
      return;
    }

    setIsLoading(true);
    dispatch(
      getDeviceFmLogs({
        plantId: Number(deviceData?.plant_id) || 0,
        deviceId: Number(device_id) || 0,
        date: runTimeDate,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          setRunTimeData(res.data);
        } else {
          Error(res.message || "Failed to get run time data");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get run time data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [runTimeDate, deviceData?.plant_id, device_id, dispatch]);

  const fetchCustomReportData = useCallback(() => {
    if (!customReportFromDate || !customReportToDate) {
      Error("Please select a date");
      return;
    }

    setIsLoading(true);
    const fromDateWithTime = `${customReportFromDate} 00:00:00`;
    const toDateWithTime = `${customReportToDate} 00:00:00`;

    dispatch(
      getFmCustomReport({
        plantId: Number(deviceData?.plant_id) || 0,
        deviceId: Number(device_id) || 0,
        from_date: fromDateWithTime,
        to_date: toDateWithTime,
        duration: customReportDuration,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          setCustomReportData(res.data);
        } else {
          Error(res.message || "Failed to get custom report data");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get custom report data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    customReportFromDate,
    customReportToDate,
    customReportDuration,
    deviceData?.plant_id,
    device_id,
    dispatch,
  ]);

  useEffect(() => {
    if (!deviceData?.plant_id || !device_id) return;

    if (
      selectedReport === "runTime" &&
      runTimeData.length === 0 &&
      runTimeDate
    ) {
      fetchRunTimeData();
    } else if (
      selectedReport === "customReport" &&
      customReportData.length === 0 &&
      customReportFromDate &&
      customReportToDate
    ) {
      fetchCustomReportData();
    }
  }, [
    selectedReport,
    deviceData?.plant_id,
    device_id,
    runTimeDate,
    customReportFromDate,
    customReportToDate,
    customReportDuration,
    fetchRunTimeData,
    fetchCustomReportData,
  ]);

  const updateActiveTab = (tab: "panel" | "reports") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
  };

  const updateSelectedReport = (
    report: "none" | "runTime" | "customReport"
  ) => {
    setSelectedReport(report);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("report", report);
      return newParams;
    });
  };

  const handleBack = () => {
    updateSelectedReport("none");
    setRunTimeDate(new Date().toISOString().split("T")[0]);
    setRunTimeData([]);
    setCustomReportFromDate(defaultCustomFrom);
    setCustomReportToDate(defaultCustomTo);
    setCustomReportData([]);
    setCustomReportDuration("15min");
  };

  const downloadCustomReportCSV = () => {
    if (customReportData.length === 0) {
      Error("No data available to download");
      return;
    }

    const useArray = customReportData.map((data, index) => ({
      "Sr No": index + 1,
      "From Time": formatDateForCSV(data.interval_start || ""),
      "To Time": formatDateForCSV(data.interval_end || ""),
      "Flow (LPM)": data.flow,
      "Totalizer (Ltr)": data.max,
    }));
    downloadCSV(
      useArray,
      `Fm_Custom_Report_${customReportFromDate}_to_${customReportToDate}`
    );
  };

  const downloadRunTimeCSV = () => {
    if (runTimeData.length === 0) {
      Error("No data available to download");
      return;
    }

    const useArray = runTimeData.map((data, index) => ({
      "Sr No": index + 1,
      "From Time": formatDateForCSV(data?.from_time || ""),
      "To Time": formatDateForCSV(data?.to_time || ""),
      "Flow (LPM)": data.flow,
      "Totalizer (Ltr)": data.max,
    }));

    downloadCSV(useArray, `Fm_Run_Time_Report_${runTimeDate || "data"}`);
  };

  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto h-full">
      <div className="flex items-center gap-4 sticky top-0 z-10">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit sticky">
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
          <button
            onClick={() =>
              navigate(
                location.pathname.startsWith("/system/device/")
                  ? `/system/device/${organizationId}/${getCurrentPlantId()}/${systemId}`
                  : "/devices"
              )
            }
            className="text-text-secondary hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span className="text-text-primary font-normal font-roboto">
              {location.pathname.startsWith("/system/device/")
                ? "System"
                : "Devices"}{" "}
            </span>
          </button>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal font-roboto">
            {deviceData?.device_name || "Unknown"}
          </span>
        </nav>

        <div className="flex h-10 items-center gap-2 text-text-secondary font-roboto bg-primary px-1 py-1 rounded-lg w-fit border border-border-primary">
          <button
            onClick={() => updateActiveTab("panel")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all duration-200 cursor-pointer font-roboto ${
              activeTab === "panel"
                ? "bg-linear-to-r text-white shadow-md"
                : "hover:text-text-primary hover:bg-overlay/20"
            }`}
          >
            <BarChart3Icon className="w-5 h-5" />
            <span className="text-sm font-normal">Panel</span>
          </button>

          <button
            onClick={() => updateActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all duration-200 cursor-pointer font-roboto ${
              activeTab === "reports"
                ? "bg-linear-to-r text-white shadow-md"
                : "hover:text-text-primary hover:bg-overlay/20"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-normal">Reports</span>
          </button>
        </div>
      </div>

      <>
        {isPanelLoading && activeTab === "panel" ? (
          <div className="flex items-center justify-center h-full bg-primary rounded-lg">
            <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "panel" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                <div className="bg-primary border border-border-primary rounded-lg px-4 py-2 h-fit">
                  <h2 className="text-xl font-normal text-text-primary mb-2 flex items-center gap-2 font-roboto">
                    <Droplets className="w-5 h-5 text-status-info" />
                    {deviceData?.device_name} Flow Rate
                  </h2>

                  <WaterGauge
                    maxValue={deviceData?.last_record?.max || 0}
                    lpmValue={deviceData?.last_record?.avg || 0}
                    maxLpmLimit={deviceData?.params?.maxThreshold || 0}
                    unit={deviceData?.unit}
                  />
                </div>

                <div className="bg-primary border border-border-primary rounded-lg overflow-hidden h-fit">
                  <h2 className="text-text-primary px-4 py-2 flex items-center gap-2 font-roboto text-xl font-normal">
                    <span className="text-status-danger text-xs">
                      <MapPinIcon className="w-5 h-5" />
                    </span>
                    Location & Monitoring
                  </h2>
                  {isPanelLoading ? (
                    <div className="flex items-center justify-center h-66 bg-primary">
                      <div className="text-text-secondary font-roboto">
                        Loading...
                      </div>
                    </div>
                  ) : (
                    <MapComponent
                      latitude={Number(deviceData?.plant_latitude) || 0}
                      longitude={Number(deviceData?.plant_longitude) || 0}
                      address={deviceData?.plant_address || ""}
                      hwid={deviceData?.hwid || ""}
                      height="h-66"
                      deviceName={deviceData?.device_name}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && (
          <div className="h-full">
            {selectedReport === "none" ? (
              <div className="rounded-lg h-full flex flex-col gap-3">
                <h2 className="text-xl font-normal text-text-primary flex items-center gap-2 font-roboto">
                  <BarChart3 className="w-5 h-5 text-status-success" />
                  Device Reports
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => updateSelectedReport("runTime")}
                    className="bg-primary rounded-lg p-6 border border-border-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left flex items-center justify-between"
                  >
                    <span className="text-text-primary font-normal text-lg">
                      Run Time Report
                    </span>
                    <ChevronRight className="w-5 h-5 text-text-primary" />
                  </button>
                  <button
                    onClick={() => updateSelectedReport("customReport")}
                    className="bg-primary rounded-lg p-6 border border-border-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left flex items-center justify-between"
                  >
                    <span className="text-text-primary font-normal text-lg">
                      Custom Report
                    </span>
                    <ChevronRight className="w-5 h-5 text-text-primary" />
                  </button>
                </div>
              </div>
            ) : selectedReport === "runTime" ? (
              <div className="rounded-lg h-full flex flex-col gap-3">
                <div className="flex items-start md:items-center flex-col md:flex-row justify-between md:gap-4 gap-2">
                  <h2
                    onClick={handleBack}
                    className="text-xl font-normal text-text-primary font-roboto flex items-center gap-2 cursor-pointer"
                  >
                    <ChevronsLeft className="w-5 h-5 text-text-primary" />
                    Run Time Report
                  </h2>

                  <div className="flex items-start md:items-center flex-col md:flex-row gap-2 md:gap-4 justify-end w-full md:w-auto">
                    <input
                      type="date"
                      value={runTimeDate}
                      onChange={(e) => setRunTimeDate(e.target.value)}
                      className="w-full md:w-auto px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchRunTimeData}
                        disabled={runTimeDate === "" || isLoading}
                        className="bg-linear-to-r text-white px-4 py-1.5 rounded-md hover:bg-linear-to-r transition-colors font-roboto text-base font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Loading..." : "Get Data"}
                      </button>
                      <button
                        onClick={downloadRunTimeCSV}
                        disabled={runTimeData.length === 0}
                        className="bg-primary text-text-primary px-4 py-1.5 rounded-md hover:bg-primary/80 transition-colors cursor-pointer font-roboto text-base font-normal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <DownloadIcon className="w-5 h-5" />
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-full bg-primary rounded-lg">
                    <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
                  </div>
                ) : runTimeData?.length === 0 ? (
                  <div className="rounded-lg pb-0 bg-primary h-full">
                    <NoDataFound
                      icon={
                        <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      }
                      title="Click on get data button to fetch the data"
                    />
                  </div>
                ) : (
                  <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
                    <div className="table-scrollbar overflow-x-auto overflow-y-auto h-[calc(100vh-305px)]">
                      <table className="w-full text-base text-left rtl:text-right text-text-primary">
                        <thead className="text-xs text-text-primary bg-primary border-b border-border-primary sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              Sr No
                            </th>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              From Time
                            </th>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              To Time
                            </th>
                            <th className="px-4 py-2 text-text-primary text-start text-base font-roboto font-normal font-roboto">
                              <span className="uppercase">Flow </span>
                              <span className="italic">
                                (
                                {deviceData?.unit === "M^3"
                                  ? "m³"
                                  : deviceData?.unit}
                                )
                              </span>
                            </th>
                            <th className="px-4 py-2 text-text-primary text-start text-base font-roboto font-normal font-roboto">
                              <span className="uppercase">Totalizer </span>
                              <span className="italic">
                                (
                                {deviceData?.unit === "M^3"
                                  ? "m³"
                                  : deviceData?.unit}
                                )
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {handlePaginatedData(runTimeData)?.length > 0 &&
                            handlePaginatedData(runTimeData)?.map(
                              (data, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border-primary bg-primary hover:bg-primary/50"
                                >
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {(currentPage - 1) * rowsPerPage +
                                      index +
                                      1}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {formatDateForCSV(data?.from_time || "")}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {formatDateForCSV(data?.to_time || "")}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {deviceData?.unit === "M^3"
                                      ? (
                                          Number(data?.flow || 0) / 1000
                                        ).toFixed(2)
                                      : Number(data?.flow || 0)}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {deviceData?.unit === "M^3"
                                      ? (Number(data?.max) / 1000).toFixed(2)
                                      : Number(data?.max)}
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages || 0}
                      rowsPerPage={rowsPerPage}
                      totalItems={totalItems}
                      selectedRows={selectedRows || 0}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                    />
                  </div>
                )}
              </div>
            ) : selectedReport === "customReport" ? (
              <div className="rounded-lg h-full flex flex-col gap-3">
                <div className="flex items-start md:items-center flex-col md:flex-row justify-between md:gap-3 gap-2">
                  <h2 className="text-xl font-normal text-text-primary font-roboto flex items-center gap-2 whitespace-nowrap">
                    <ChevronsLeft
                      onClick={handleBack}
                      className="w-5 h-5 text-text-primary cursor-pointer"
                    />
                    Custom Report
                  </h2>

                  <div className="flex items-start md:items-end flex-col md:flex-row flex-wrap gap-2 md:gap-3 justify-end w-full md:w-auto">
                    <div className="flex flex-col">
                      <label
                        htmlFor="customReportDuration"
                        className="mb-1 text-base text-text-primary font-roboto"
                      >
                        Duration
                      </label>
                      <select
                        id="customReportDuration"
                        value={customReportDuration}
                        onChange={(e) =>
                          setCustomReportDuration(
                            e.target.value as "15min" | "1hour" | "1day"
                          )
                        }
                        className="w-42 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
                      >
                        <option value="15min">15 Minutes</option>
                        <option value="1hour">1 Hour</option>
                        <option value="1day">Daily</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="customReportFromDate"
                        className="mb-1 text-base text-text-primary font-roboto"
                      >
                        From
                      </label>
                      <input
                        id="customReportFromDate"
                        type="date"
                        value={customReportFromDate}
                        onChange={(e) =>
                          setCustomReportFromDate(e.target.value)
                        }
                        className="w-48 md:w-42 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="customReportToDate"
                        className="mb-1 text-base text-text-primary font-roboto"
                      >
                        To
                      </label>
                      <input
                        id="customReportToDate"
                        type="date"
                        value={customReportToDate}
                        onChange={(e) => setCustomReportToDate(e.target.value)}
                        className="w-48 md:w-42 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchCustomReportData}
                        disabled={
                          customReportFromDate === "" ||
                          customReportToDate === "" ||
                          isLoading
                        }
                        className="whitespace-nowrap bg-linear-to-r text-white px-4 py-1.5 rounded-md hover:bg-linear-to-r transition-colors font-roboto text-base font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Get Data
                      </button>
                      <button
                        onClick={downloadCustomReportCSV}
                        disabled={customReportData.length === 0}
                        className="whitespace-nowrap bg-primary text-text-primary px-4 py-1.5 rounded-md hover:bg-primary/50 transition-colors cursor-pointer font-roboto text-base font-normal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <DownloadIcon className="w-5 h-5" />
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-full bg-primary rounded-lg">
                    <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
                  </div>
                ) : customReportData?.length === 0 ? (
                  <div className="rounded-lg pb-0 bg-primary h-full">
                    <NoDataFound
                      icon={
                        <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      }
                      title="Click on get data button to fetch the data"
                    />
                  </div>
                ) : (
                  <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
                    <div className="table-scrollbar overflow-x-auto overflow-y-auto h-[calc(100vh-332px)]">
                      <table className="w-full text-base text-left rtl:text-right text-text-primary">
                        <thead className="text-xs text-text-primary bg-primary border-b border-border-primary sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              Sr No
                            </th>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              From Time
                            </th>
                            <th className="px-4 py-2 text-text-primary uppercase text-start text-base font-roboto font-normal font-roboto">
                              To Time
                            </th>
                            <th className="px-4 py-2 text-text-primary text-start text-base font-roboto font-normal font-roboto">
                              <span className="uppercase">Flow </span>
                              <span className="italic">
                                (
                                {flowUnit(
                                  selectedReport,
                                  customReportDuration,
                                  deviceData
                                )}
                                )
                              </span>
                            </th>
                            <th className="px-4 py-2 text-text-primary text-start text-base font-roboto font-normal font-roboto">
                              <span className="uppercase">Totalizer </span>
                              <span className="italic">
                                (
                                {deviceData?.unit === "M^3"
                                  ? "m³"
                                  : deviceData?.unit}
                                )
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {handlePaginatedData(customReportData)?.length > 0 &&
                            handlePaginatedData(customReportData)?.map(
                              (data, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border-primary bg-primary hover:bg-primary/50"
                                >
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {(currentPage - 1) * rowsPerPage +
                                      index +
                                      1}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {formatDateForCSV(
                                      data?.interval_start || ""
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {formatDateForCSV(data?.interval_end || "")}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {(() => {
                                      const flowValue =
                                        flowUnit(
                                          selectedReport,
                                          customReportDuration,
                                          deviceData
                                        ) === "LPM"
                                          ? Number(data?.avg || 0)
                                          : Number(data?.flow || 0);
                                      return deviceData?.unit === "M^3"
                                        ? (flowValue / 1000).toFixed(3)
                                        : Number(flowValue);
                                    })()}
                                  </td>
                                  <td className="px-4 py-3 text-text-primary text-start font-roboto text-base capitalize">
                                    {deviceData?.unit === "M^3"
                                      ? (Number(data?.max) / 1000).toFixed(3)
                                      : Number(data?.max)}
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages || 0}
                      rowsPerPage={rowsPerPage}
                      totalItems={totalItems}
                      selectedRows={selectedRows || 0}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </>
    </div>
  );
};

export default FmDevice;
