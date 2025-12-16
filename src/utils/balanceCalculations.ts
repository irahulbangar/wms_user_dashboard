import type { DevicesResult } from "../../model/devices.interface";
import { getDeviceValue, getReportTypeColor } from "./deviceHelpers";

type ContextType = "system" | "department" | "plant" | "organization";

interface BalanceDataItem {
  name: string;
  value: number;
  color: string;
}

/**
 * Get the appropriate ID field based on context
 */
const getInId = (
  device: DevicesResult,
  context: ContextType
): number | null => {
  if (context === "system") return device.in_system_id;
  if (context === "department") return device.in_department_id;
  if (context === "plant") return device.in_plant_id;
  if (context === "organization") return device.organization_id;
  return null;
};

const getOutId = (
  device: DevicesResult,
  context: ContextType
): number | null => {
  if (context === "system") return device.out_system_id;
  if (context === "department") return device.out_department_id;
  if (context === "plant") return device.out_plant_id;
  if (context === "organization") return device.organization_id;
  return null;
};

/**
 * Calculate water balance data for a system or department
 */
export const calculateWaterBalance = (
  devices: DevicesResult[],
  id: string | number,
  context: ContextType = "plant"
): BalanceDataItem[] => {
  if (!devices || devices.length === 0 || !id) {
    return [
      { name: "Flow In", value: 0, color: getReportTypeColor("Flow In") },
      { name: "Flow Out", value: 0, color: getReportTypeColor("Flow Out") },
      {
        name: "Percolation",
        value: 0,
        color: getReportTypeColor("Percolation"),
      },
      {
        name: "Evaporation",
        value: 0,
        color: getReportTypeColor("Evaporation"),
      },
      {
        name: "Consumption",
        value: 0,
        color: getReportTypeColor("Consumption"),
      },
      { name: "Wastage", value: 0, color: getReportTypeColor("Wastage") },
      {
        name: "Regeneration",
        value: 0,
        color: getReportTypeColor("Regeneration"),
      },
      { name: "Re-use", value: 0, color: getReportTypeColor("Re-use") },
    ];
  }

  const idNum = Number(id);
  const inReportTypes = ["In", "Regeneration", "Re-use","Rainfall"];
  const outReportTypes = ["Out", "Percolation", "Consumption", "Wastage", "Evaporation"];

  const flowInTotal = devices
    .filter((device) => {
      return (
        getInId(device, context) === idNum && device.report_type_name === "Flow"
      );
    })
    .reduce((sum, device) => sum + getDeviceValue(device), 0);

  const flowOutTotal = devices
    .filter((device) => {
      return (
        getOutId(device, context) === idNum &&
        device.report_type_name === "Flow"
      );
    })
    .reduce((sum, device) => sum + getDeviceValue(device), 0);

  const calculateReportTypeTotal = (reportType: string): number => {
    return devices
      .filter((device) => {
        if (device.report_type_name !== reportType) {
          return false;
        }

        if (inReportTypes.includes(reportType)) {
          return getInId(device, context) === idNum;
        }

        if (outReportTypes.includes(reportType)) {
          return getOutId(device, context) === idNum;
        }

        return false;
      })
      .reduce((sum, device) => sum + getDeviceValue(device), 0);
  };

  return [
    {
      name: "Flow In",
      value: flowInTotal,
      color: getReportTypeColor("Flow In"),
    },
    {
      name: "Flow Out",
      value: flowOutTotal,
      color: getReportTypeColor("Flow Out"),
    },
    {
      name: "Percolation",
      value: calculateReportTypeTotal("Percolation"),
      color: getReportTypeColor("Percolation"),
    },
    {
      name: "Evaporation",
      value: calculateReportTypeTotal("Evaporation"),
      color: getReportTypeColor("Evaporation"),
    },
    {
      name: "Consumption",
      value: calculateReportTypeTotal("Consumption"),
      color: getReportTypeColor("Consumption"),
    },
    {
      name: "Wastage",
      value: calculateReportTypeTotal("Wastage"),
      color: getReportTypeColor("Wastage"),
    },
    {
      name: "Regeneration",
      value: calculateReportTypeTotal("Regeneration"),
      color: getReportTypeColor("Regeneration"),
    },
    {
      name: "Re-use",
      value: calculateReportTypeTotal("Re-use"),
      color: getReportTypeColor("Re-use"),
    },
  ];
};

/**
 * Calculate flow balance data for a system or department
 */
export const calculateFlowBalance = (
  devices: DevicesResult[],
  id: string | number,
  context: ContextType = "plant"
): BalanceDataItem[] => {
  if (!devices || devices.length === 0 || !id) {
    return [
      { name: "Total In", value: 0, color: "#5070de" },
      { name: "Total Out", value: 0, color: "#b6d733" },
    ];
  }

  const idNum = Number(id);

  const totalIn = devices
    .filter((device) => getInId(device, context) === idNum)
    .reduce((sum, device) => sum + getDeviceValue(device), 0);

  const totalOut = devices
    .filter((device) => getOutId(device, context) === idNum)
    .reduce((sum, device) => sum + getDeviceValue(device), 0);

  return [
    { name: "Total In", value: totalIn, color: "#5070de" },
    { name: "Total Out", value: totalOut, color: "#b6d733" },
  ];
};

/**
 * Calculate storage balance data for a system or department
 */
export const calculateStorageBalance = (
  devices: DevicesResult[],
  id: string | number,
  context: ContextType = "plant"
): BalanceDataItem[] => {
  if (!devices || devices.length === 0 || !id) {
    return [
      { name: "Total Stock", value: 0, color: "#5070de" },
      { name: "Available Capacity", value: 0, color: "#7da6d2" },
    ];
  }

  const idNum = Number(id);

  let totalStock = 0;
  let totalCapacity = 0;

  devices.forEach((device) => {
    if (device.device_family_type === "tank") {
      const inId = getInId(device, context);
      const outId = getOutId(device, context);
      //   const contextId = getContextId(device, context);

      if (inId === idNum || outId === idNum) {
        const capacity = Number(device.params?.storageCapacity) || 0;
        const height = Number(device?.params?.height) || 0;
        const lastLevel = Number(device.last_record?.last_level) || 0;
        const crossSectionArea = Number(device?.params?.crossSectionArea) || 0;
        const currentLevel = (height - lastLevel) * crossSectionArea || 0;
        totalCapacity += capacity;
        totalStock += currentLevel;
      }
    }
  });

  const availableCapacity = Math.max(0, totalCapacity - totalStock);

  return [
    { name: "Total Stock", value: totalStock, color: "#5070de" },
    {
      name: "Available Capacity",
      value: availableCapacity,
      color: "#7da6d2",
    },
  ];
};

/**
 * Get water balance colors
 */
export const getWaterBalanceColors = () => [
  getReportTypeColor("Flow In"),
  getReportTypeColor("Flow Out"),
  getReportTypeColor("Percolation"),
  getReportTypeColor("Evaporation"),
  getReportTypeColor("Consumption"),
  getReportTypeColor("Wastage"),
  getReportTypeColor("Regeneration"),
  getReportTypeColor("Re-use"),
  getReportTypeColor("Rainfall"),
];

/**
 * Get flow balance colors
 */
export const getFlowBalanceColors = () => ["#5070de", "#b6d733"];

/**
 * Get storage balance colors
 */
export const getStorageBalanceColors = () => ["#5070de", "#7da6d2"];

/**
 * Get context-specific IDs from device
 */
const getContextIds = (
  device: DevicesResult,
  context: "system" | "department"
): number[] => {
  if (context === "system") {
    return [device.system_id, device.in_system_id, device.out_system_id].filter(
      Boolean
    ) as number[];
  } else {
    return [
      device.department_id,
      device.in_department_id,
      device.out_department_id,
    ].filter(Boolean) as number[];
  }
};

/**
 * Get context-specific name from device
 */
const getContextName = (
  device: DevicesResult,
  contextId: number,
  context: "system" | "department"
): string => {
  if (context === "system") {
    if (device.system_id === contextId) {
      return device.system_name || `System ${contextId}`;
    } else if (device.in_system_id === contextId) {
      return device.in_system_name || `System ${contextId}`;
    } else {
      return device.out_system_name || `System ${contextId}`;
    }
  } else {
    if (device.department_id === contextId) {
      return device.department_name || `Department ${contextId}`;
    } else if (device.in_department_id === contextId) {
      return device.in_department_name || `Department ${contextId}`;
    } else {
      return device.out_department_name || `Department ${contextId}`;
    }
  }
};

/**
 * Get the in ID for a specific context
 */
const getContextInId = (
  device: DevicesResult,
  context: "system" | "department"
): number | null => {
  return context === "system" ? device.in_system_id : device.in_department_id;
};

/**
 * Get the out ID for a specific context
 */
const getContextOutId = (
  device: DevicesResult,
  context: "system" | "department"
): number | null => {
  return context === "system" ? device.out_system_id : device.out_department_id;
};

/**
 * Get report type field (handles both report_type and report_type_name)
 */
const getReportType = (device: DevicesResult): string => {
  return device.report_type_name || device.report_type || "";
};

/**
 * Unified function to calculate balances for system or department
 */
const calculateBalances = (
  devices: DevicesResult[],
  context: "system" | "department"
): Array<{
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit?: string;
}> => {
  if (!devices || devices.length === 0) return [];

  const inReportTypes = ["In", "Regeneration", "Re-use","Rainfall"];
  const outReportTypes = ["Out", "Percolation", "Consumption", "Wastage", "Evaporation"];

  const contextMap = new Map<
    number,
    {
      id: number;
      name: string;
      totalIn: number;
      totalOut: number;
      unit?: string;
    }
  >();

  devices.forEach((device) => {
    const contextIds = getContextIds(device, context);

    contextIds.forEach((contextId) => {
      if (!contextMap.has(contextId)) {
        contextMap.set(contextId, {
          id: contextId,
          name: getContextName(device, contextId, context),
          totalIn: 0,
          totalOut: 0,
          unit: device.unit || "",
        });
      }
    });
  });

  contextMap.forEach((contextItem, contextId) => {
    const inDevices = devices.filter((device) => {
      const inId = getContextInId(device, context);
      const reportType = getReportType(device);
      return (
        inId === contextId &&
        (inReportTypes.includes(reportType) || reportType === "Flow")
      );
    });
    contextItem.totalIn = inDevices.reduce(
      (sum, device) => sum + getDeviceValue(device),
      0
    );

    const outDevices = devices.filter((device) => {
      const outId = getContextOutId(device, context);
      const reportType = getReportType(device);
      return (
        outId === contextId &&
        (outReportTypes.includes(reportType) || reportType === "Flow")
      );
    });
    contextItem.totalOut = outDevices.reduce(
      (sum, device) => sum + getDeviceValue(device),
      0
    );
  });

  return Array.from(contextMap.values())
    .map((item) => ({
      id: item.id,
      name: item.name.trim(),
      totalIn: item.totalIn,
      totalOut: item.totalOut,
      balance: item.totalIn - item.totalOut,
      unit: item.unit,
    }))
    .sort((a, b) => a.id - b.id);
};

/**
 * Calculate system balances from devices
 * Used for department view to show system balances
 */
export const calculateSystemBalances = (
  devices: DevicesResult[]
): Array<{
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit?: string;
}> => {
  return calculateBalances(devices, "system");
};

/**
 * Calculate department balances from devices
 */
export const calculateDepartmentBalances = (
  devices: DevicesResult[]
): Array<{
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit: string | undefined;
}> => {
  return calculateBalances(devices, "department") as Array<{
    id: number;
    name: string;
    totalIn: number;
    totalOut: number;
    balance: number;
    unit: string | undefined;
  }>;
};

export const calculateSystemWaterBalance = (
  devices: DevicesResult[],
  systemId: string | number
) => calculateWaterBalance(devices, systemId, "system");

export const calculateDepartmentWaterBalance = (
  devices: DevicesResult[],
  departmentId: string | number
) => calculateWaterBalance(devices, departmentId, "department");

export const calculatePlantWaterBalance = (
  devices: DevicesResult[],
  plantId: string | number
) => calculateWaterBalance(devices, plantId, "plant");

export const calculateSystemFlowBalance = (
  devices: DevicesResult[],
  systemId: string | number
) => calculateFlowBalance(devices, systemId, "system");

export const calculateDepartmentFlowBalance = (
  devices: DevicesResult[],
  departmentId: string | number
) => calculateFlowBalance(devices, departmentId, "department");

export const calculateSystemStorageBalance = (
  devices: DevicesResult[],
  systemId: string | number
) => calculateStorageBalance(devices, systemId, "system");

export const calculatePlantFlowBalance = (
  devices: DevicesResult[],
  plantId: string | number
) => calculateFlowBalance(devices, plantId, "plant");

export const calculatePlantStorageBalance = (
  devices: DevicesResult[],
  plantId: string | number
) => calculateStorageBalance(devices, plantId, "plant");

export const calculateDepartmentStorageBalance = (
  devices: DevicesResult[],
  departmentId: string | number
) => calculateStorageBalance(devices, departmentId, "department");

export const calculateOrganizationStorageBalance = (
  devices: DevicesResult[],
  organizationId: string | number
) => calculateStorageBalance(devices, organizationId, "organization");

export const getSystemWaterBalanceColors = getWaterBalanceColors;
export const getDepartmentWaterBalanceColors = getWaterBalanceColors;
export const getSystemFlowBalanceColors = getFlowBalanceColors;
export const getDepartmentFlowBalanceColors = getFlowBalanceColors;
export const getSystemStorageBalanceColors = getStorageBalanceColors;
export const getDepartmentStorageBalanceColors = getStorageBalanceColors;
export const getPlantWaterBalanceColors = getWaterBalanceColors;
export const getPlantFlowBalanceColors = getFlowBalanceColors;
export const getPlantStorageBalanceColors = getStorageBalanceColors;
export const getOrganizationStorageBalanceColors = getStorageBalanceColors;
