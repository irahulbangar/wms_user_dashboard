import type { DevicesResult } from "../../model/devices.interface";
import waterTank from "../assets/images/tank-logo.svg";
import flowMeter from "../assets/images/fm-logo.svg";
import brwhms from "../assets/images/brwhms-logo.png";
import bdwfms from "../assets/images/bdwfms-logo.png";
import arg from "../assets/images/arg-logo.png";
import phmc from "../assets/images/phmc-logo.png";
import virtual from "../assets/images/virtual.png";
import dwlr from "../assets/images/dwlr-logo.png";
import smart from "../assets/images/smart-logo.png";

export const getReportTypeColor = (reportType: string): string => {
  const colors: Record<string, string> = {
    "Flow In": "#5070de",
    "Flow Out": "#b6d733",
    Percolation: "#505472",
    Evaporation: "#fe994e",
    Consumption: "#0ca9df",
    Wastage: "#ffd209",
    Regeneration: "#fa6488",
    Rainfall: "#40bf96",
    "Re-use": "#7a5db0",
    "Net Balance": "#6B7280",
    Unknown: "#7da6d2",
    // Water Quality metrics
    PH: "#e74c3c",
    EC: "#3498db",
    TDS: "#2ecc71",
    COD: "#f39c12",
    BOD: "#9b59b6",
  };
  return colors[reportType] || "";
};

export const getDeviceLogo = (device: DevicesResult): string => {
  if (device?.device_family_type === "fm") {
    return flowMeter;
  } else if (device?.device_family_type === "tank") {
    return waterTank;
  } else if (device?.device_family_type === "brwhms") {
    return brwhms;
  } else if (device?.device_family_type === "BDWFMS") {
    return bdwfms;
  } else if (device?.device_family_type === "arg") {
    return arg;
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    return phmc;
  } else if (device?.device_family_type === "virtual") {
    return virtual;
  } else if (device?.device_family_type === "dwlr") {
    return dwlr;
  } else if (device?.device_family_type === "smart") {
    return smart;
  }
  return "";
};

export const getDeviceValue = (device: DevicesResult): number => {
  let value = 0;
  switch (device.device_family_type) {
    case "fm":
    case "brwhms":
      value = Number(device?.last_record?.total) || 0;
      break;
    case "BDWFMS":
      value = Number(device?.last_record?.total) || 0;
      break;
    case "phmc":
      if (
        device.device_type === "New phmc" &&
        device.device_family_type === "phmc"
      ) {
        value = Number(device.last_record?.flowrate) || 0;
      } else {
        value = 0;
      }
      break;
    case "arg":
      value = Number(device.last_record?.max_mm) || 0;
      break;
    case "dwlr":
      value = Number(device.last_record?.max) || 0;
      break;
    default:
      value = 0;
  }
  return value || 0;
};

export const getTotalizerText = (device: DevicesResult): string => {
  if (device?.device_family_type === "fm") {
    return "Totalizer";
  } else if (device?.device_family_type === "brwhms") {
    return "Totalizer";
  } else if (device?.device_family_type === "BDWFMS") {
    return "Totalizer";
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    return "Totalizer";
  } else if (device?.device_family_type === "tank") {
    return "Volume";
  }
  return "";
};

export const getTotalizer = (device: DevicesResult): string => {
  if (device?.device_family_type === "virtual") {
    return "";
  }

  let value = 0;

  const height = Number(device?.params?.height || 0);
  const crossSectionArea = device?.params?.crossSectionArea || 0;
  const lastLevel = Number(device?.last_record?.last_level || 0);

  if (device?.device_family_type === "fm") {
    value = Number(device?.last_record?.max) || 0;
  } else if (device?.device_family_type === "brwhms") {
    value = Number(device?.last_record?.total) || 0;
  } else if (device?.device_family_type === "BDWFMS") {
    value = Number(device?.last_record?.total) || 0;
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    value = Number(device?.last_record?.totalizer) || 0;
  } else if (device?.device_family_type === "arg") {
    value = Number(device?.last_record?.max_mm) || 0;
  } else if (device?.device_family_type === "tank") {
    value = Number(((height - lastLevel) * crossSectionArea).toFixed(0)) || 0;
  }

  if (device?.unit === "M^3") {
    value = value / 1000;
  }

  const unit = device?.unit === "M^3" ? "m³" : device?.unit || "";
  return `${value.toFixed(2)} ${unit}`;
};

export const getTotalizerString = (device: DevicesResult): string => {
  if (device?.device_family_type === "virtual") {
    return "";
  }

  let value = 0;

  if (device?.device_family_type === "fm") {
    value = Number(device?.last_record?.max) || 0;
  } else if (device?.device_family_type === "brwhms") {
    value = Number(device?.last_record?.total) || 0;
  } else if (device?.device_family_type === "BDWFMS") {
    value = Number(device?.last_record?.total) || 0;
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    value = Number(device?.last_record?.totalizer) || 0;
  } else if (device?.device_family_type === "arg") {
    value = Number(device?.last_record?.max_mm) || 0;
  } else if (device?.device_family_type === "tank") {
    value =
      Number(
        (device?.params?.height || 0) -
          Number(device?.last_record?.last_level || 0) *
            (device?.params?.crossSectionArea || 0)
      ) || 0;
  }

  if (device?.unit === "M^3") {
    value = value / 1000;
  }

  const unit = device?.unit === "M^3" ? "m3" : device?.unit;
  return `${value.toFixed(2)} ${unit || ""}`;
};

export const getFlowText = (device: DevicesResult): string => {
  if (device?.device_family_type === "fm") {
    return "Flow";
  } else if (device?.device_family_type === "brwhms") {
    return "Flow";
  } else if (device?.device_family_type === "BDWFMS") {
    return "Flow";
  } else if (device?.device_family_type === "tank") {
    return "Level";
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    return "Flow";
  }
  return "";
};

export const getFlow = (device: DevicesResult): string => {
  if (device?.device_family_type === "virtual") {
    return "";
  }

  let value = 0;

  if (device?.device_family_type === "fm") {
    value = Number(device?.last_record?.avg) || 0;
  } else if (device?.device_family_type === "tank") {
    value = Number(device?.last_record?.last_level) || 0;
  } else if (device?.device_family_type === "brwhms") {
    value = Number(device?.last_record?.avg) || 0;
  } else if (device?.device_family_type === "BDWFMS") {
    value = Number(device?.last_record?.avg) || 0;
  } else if (
    device?.device_family_type === "phmc" &&
    device?.device_type === "New phmc"
  ) {
    value = Number(device?.last_record?.flowrate) || 0;
  }

  if (device?.device_family_type === "tank") {
    return `${value.toFixed(2)} MM`;
  }

  if (device?.unit === "M^3") {
    value = value / 1000;
  }

  const unit = device?.unit === "M^3" ? "m³" : device?.unit || "";
  return value ? `${value.toFixed(2)} ${unit}` : "";
};

export const deviceStatus = (status: string): string => {
  if (status === "active" || status === "Active") {
    return "bg-green-100 text-status-success";
  } else if (status === "inactive" || status === "Inactive") {
    return "bg-red-100 text-status-danger";
  } else if (status === "maintenance" || status === "Maintenance") {
    return "bg-yellow-100 text-status-warning";
  } else {
    return "bg-blue-100 text-status-info";
  }
};

export const getDeviceRoute = (
  device: DevicesResult,
  basePath: "department" | "system" = "department"
): string | null => {
  const deviceType = device?.device_family_type?.toLowerCase() || "";

  if (deviceType.includes("virtual")) {
    return null;
  }

  const pathPrefix = `/${basePath}/device`;

  if (deviceType.includes("fm") || deviceType.includes("FM")) {
    return `${pathPrefix}/fm-device/${device?.device_id}`;
  } else if (deviceType.includes("tank") || deviceType.includes("Tank")) {
    return `${pathPrefix}/tank-device/${device?.device_id}`;
  } else if (deviceType.includes("brwhms") || deviceType.includes("Brwhms")) {
    return `${pathPrefix}/brwhms-device/${device?.device_id}`;
  } else if (deviceType.includes("BDWFMS") || deviceType.includes("Bdwfms")) {
    return `${pathPrefix}/bdwfms-device/${device?.device_id}`;
  } else if (deviceType.includes("arg") || deviceType.includes("Arg")) {
    return `${pathPrefix}/arg-device/${device?.device_id}`;
  } else if (deviceType.includes("phmc") || deviceType.includes("Phmc")) {
    return `${pathPrefix}/phmc-device/${device?.device_id}`;
  } else if (deviceType.includes("dwlr") || deviceType.includes("Dwlr")) {
    return `${pathPrefix}/dwlr-device/${device?.device_id}`;
  } else {
    return `${pathPrefix}/fm-device/${device?.device_id}`;
  }
};
