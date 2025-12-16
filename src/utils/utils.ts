import { mkConfig, generateCsv, asBlob } from "export-to-csv";
import type { SingleDeviceResult } from "../../model/single-device.interface";

export const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const fromatDateWithTime = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

/**
 * Converts a date string to dd/mm/yyyy format with time (dd/mm/yyyy HH:mm)
 * @param dateString - The date string to convert
 * @returns Formatted date string in dd/mm/yyyy HH:mm format
 */
export const formatDateForCSV = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date for CSV:", error);
    return dateString;
  }
};

export const handleStatus = (status: string) => {
  if (status === "Active" || status === "active") {
    return "bg-green-100 text-status-success";
  } else if (status === "Inactive" || status === "inactive") {
    return "bg-red-100 text-status-danger";
  } else {
    return "bg-yellow-100 text-status-warning";
  }
};

export const downloadCSV = (
  data: Record<string, string | number>[],
  fileName: string
) => {
  const config = mkConfig({
    fieldSeparator: ",",
    useKeysAsHeaders: true,
  });
  const csv = generateCsv(config)(data);
  const blob = asBlob(config)(csv);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const formatDateWithTime = (dateString: string | number): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const dateObject = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${dateObject} ${hours}:${minutes}:${seconds}`;
};

/**
 * Checks if a record time is older than 24 hours
 * @param lastRecordTime - The last record time as a string (can be "N/A" or a date string)
 * @returns true if the record time is older than 24 hours, false otherwise
 */
export const isRecordTimeOld = (
  lastRecordTime: string | undefined | null
): boolean => {
  if (!lastRecordTime || lastRecordTime === "N/A") return false;
  try {
    const recordDate = new Date(lastRecordTime);
    const now = new Date();
    const diffInMs = now.getTime() - recordDate.getTime();
    const hours24InMs = 24 * 60 * 60 * 1000;
    return diffInMs > hours24InMs;
  } catch {
    return false;
  }
};

/**
 * Calculates from_date and to_date based on date selection type
 * @param dateSelectionType - Type of date selection: "daily" | "monthly" | "yearly" | "custom"
 * @param dailyDate - Selected daily date (YYYY-MM-DD format)
 * @param monthYear - Selected month-year (YYYY-MM format)
 * @param yearlyDate - Selected year (YYYY format)
 * @param customStartDate - Custom start date (YYYY-MM-DD format)
 * @param customEndDate - Custom end date (YYYY-MM-DD format)
 * @returns Object with fromDate and toDate in YYYY-MM-DD HH:mm:ss format
 */
export const getDateRange = (
  dateSelectionType: "daily" | "monthly" | "yearly" | "custom",
  dailyDate: string,
  monthYear: string,
  yearlyDate: string,
  customStartDate: string,
  customEndDate: string
): { fromDate: string; toDate: string } => {
  let fromDate = "";
  let toDate = "";

  switch (dateSelectionType) {
    case "daily": {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      fromDate = `${dailyDate} 00:00:00`;

      if (dailyDate === todayStr) {
        const currentTime = `${String(today.getHours()).padStart(
          2,
          "0"
        )}:${String(today.getMinutes()).padStart(2, "0")}:${String(
          today.getSeconds()
        ).padStart(2, "0")}`;
        toDate = `${dailyDate} ${currentTime}`;
      } else {
        toDate = `${dailyDate} 23:59:59`;
      }
      break;
    }
    case "monthly": {
      const [year, month] = monthYear.split("-");
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

      const firstDayStr = `${year}-${String(month).padStart(2, "0")}-01`;

      if (year === currentYear && month === currentMonth) {
        const todayStr = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        toDate = `${todayStr} 23:59:59`;
      } else {
        const lastDay = new Date(Number(year), Number(month), 0);
        const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${String(
          lastDay.getDate()
        ).padStart(2, "0")}`;
        toDate = `${lastDayStr} 23:59:59`;
      }

      fromDate = `${firstDayStr} 00:00:00`;
      break;
    }
    case "yearly": {
      const year = yearlyDate;
      const currentYear = new Date().getFullYear().toString();
      const today = new Date();

      fromDate = `${year}-01-01 00:00:00`;

      if (year === currentYear) {
        const todayStr = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        toDate = `${todayStr} 23:59:59`;
      } else {
        toDate = `${year}-12-31 23:59:59`;
      }
      break;
    }
    case "custom": {
      fromDate = `${customStartDate} 00:00:00`;
      toDate = `${customEndDate} 23:59:59`;
      break;
    }
    default: {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0);

      fromDate = `${year}-${month}-01 00:00:00`;
      toDate = `${year}-${month}-${String(lastDay.getDate()).padStart(
        2,
        "0"
      )} 23:59:59`;
      break;
    }
  }

  return { fromDate, toDate };
};

export const flowUnit = (
  selectedReport: string,
  customReportDuration: string,
  deviceData: SingleDeviceResult | null | undefined
): string => {
  const unit = deviceData?.unit;
  if (selectedReport === "customReport") {
    const isCubicMeter = unit === "M^3";
    switch (customReportDuration) {
      case "15min":
        return isCubicMeter ? "m³/M" : "LPM";
      case "1hour":
        return isCubicMeter ? "m³/H" : "LPH";
      case "1day":
        return isCubicMeter ? "m³/D" : "LPD";
      default:
        return unit === "M^3" ? "m³" : "Ltr";
    }
  }
  return unit === "M^3" ? "m³" : "Ltr";
};
