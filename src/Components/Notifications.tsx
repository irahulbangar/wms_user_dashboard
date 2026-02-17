import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getPlantAlerts } from "../../store/plantSlice";
import { Error } from "../utils/toast";
import { getCurrentPlantId } from "../utils/plantUtils";
import type { PlantAlertResult } from "../../model/plant-alert.interface";
import { formatDateWithTime } from "../utils/utils";
import {
  AlertCircle,
  XCircle,
  Info,
  Calendar,
  Bell,
  Loader2,
} from "lucide-react";

const Notifications = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [alerts, setAlerts] = useState<PlantAlertResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [selectedStatus] = useState<string>("all");
  const pageSize = 20;

  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      yyyy: now.getFullYear(),
      mm: now.getMonth() + 1,
    };
  };

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const plantId = getCurrentPlantId();
    if (!plantId) {
      Error("Plant ID not found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { yyyy, mm } = getCurrentMonthYear();

    try {
      const response = await dispatch(
        getPlantAlerts({
          plant_id: Number(plantId),
          page_no: currentPage,
          page_size: pageSize,
          yyyy,
          mm,
        }),
      ).unwrap();

      if (response.success) {
        setAlerts(response.data);
        setTotalAlerts(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
      } else {
        Error(response.message || "Failed to fetch alerts");
      }
    } catch (err: any) {
      Error(err.message || "Failed to fetch alerts");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, isAuthenticated]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const normalizeDate = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateString.split("T")[0].split(" ")[0];
      }
      return "Unknown";
    }
  };

  const groupedAlerts = useMemo(() => {
    const grouped: Record<string, PlantAlertResult[]> = {};

    alerts.forEach((alert) => {
      const dateKey = normalizeDate(alert.date || alert.created_at);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(alert);
    });

    const sortedDates = Array.from(new Set(Object.keys(grouped))).sort(
      (a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return new Date(b).getTime() - new Date(a).getTime();
      },
    );

    return { grouped, sortedDates };
  }, [alerts]);

  const filteredGroupedAlerts = useMemo(() => {
    const { grouped, sortedDates } = groupedAlerts;
    const filtered: Record<string, PlantAlertResult[]> = {};

    sortedDates.forEach((date) => {
      const dateAlerts = grouped[date].filter((alert) => {
        const statusMatch =
          selectedStatus === "all" || alert.alert_status === selectedStatus;
        return statusMatch;
      });

      if (dateAlerts.length > 0) {
        filtered[date] = dateAlerts;
      }
    });

    return filtered;
  }, [groupedAlerts, selectedStatus]);

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <XCircle className="w-5 h-5 text-status-danger" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-status-warning" />;
      case "low":
        return <Info className="w-5 h-5 text-status-info" />;
      default:
        return <Info className="w-5 h-5 text-text-secondary" />;
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-text-primary text-xl font-roboto font-medium">
            Notifications
          </h1>
          <p className="text-text-secondary text-sm font-roboto">
            {totalAlerts} Total Alert{totalAlerts !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : Object.keys(filteredGroupedAlerts).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full bg-primary rounded-lg text-center">
          <Bell className="w-16 h-16 text-text-secondary mb-4 opacity-50" />
          <p className="text-text-secondary text-lg font-roboto">
            No alerts found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-y-auto">
          {Array.from(new Set(Object.keys(filteredGroupedAlerts)))
            .sort((a, b) => {
              if (a === "Unknown") return 1;
              if (b === "Unknown") return -1;
              return new Date(b).getTime() - new Date(a).getTime();
            })
            .map((date) => (
              <div key={date} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <h2 className="text-text-primary text-lg font-roboto font-medium">
                    {formatDateHeader(date)}
                  </h2>
                  <span className="text-text-secondary text-sm font-roboto">
                    ({filteredGroupedAlerts[date].length} alert
                    {filteredGroupedAlerts[date].length !== 1 ? "s" : ""})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredGroupedAlerts[date].map((alert, index) => (
                    <div
                      key={`${alert.device_id}-${alert.system_id}-${alert.plant_id}-${alert.department_id}-${alert.created_at}-${index}`}
                      className="bg-card border border-border-primary rounded-lg p-4 hover:bg-hover-bg-primary transition-colors flex flex-col h-full"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="shrink-0 mt-1">
                          {getPriorityIcon(alert.alert_priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary text-base font-roboto font-medium mb-2 line-clamp-2">
                            {alert.alert_title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-text-secondary text-sm font-roboto mb-3 line-clamp-3 flex-1">
                        {alert.alert_message}
                      </p>

                      <div className="flex flex-col gap-2 text-xs text-text-secondary font-roboto pt-3 border-t border-border-primary">
                        {alert.created_at && (
                          <div className="flex items-center gap-1">
                            <span className="whitespace-nowrap">Created :</span>
                            <span className="truncate">
                              {formatDateWithTime(alert.created_at)}
                            </span>
                          </div>
                        )}
                        {alert.updated_at &&
                          alert.updated_at !== alert.created_at && (
                            <div className="flex items-center gap-1">
                              <span className="whitespace-nowrap">
                                Updated :
                              </span>
                              <span className="truncate">
                                {formatDateWithTime(alert.updated_at)}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 bg-card border border-border-primary rounded-lg hover:bg-hover-bg-primary transition-colors text-text-primary font-roboto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-roboto text-sm transition-colors ${
                    currentPage === pageNum
                      ? "bg-status-info text-white"
                      : "bg-card border border-border-primary text-text-primary hover:bg-hover-bg-primary"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 bg-card border border-border-primary rounded-lg hover:bg-hover-bg-primary transition-colors text-text-primary font-roboto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <span className="text-text-secondary text-sm font-roboto ml-4">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default Notifications;
