import {
  getSystemConnection,
  getPlantConnection,
  getDepartmentConnection,
} from "./connectionHelpers";
import { calculateTankFlowTotals } from "./flowCalculations";
import {
  calculateDepartmentTotals,
  calculatePlantTotals,
} from "./deviceFlowCalculations";
import { calculateSystemTotals } from "./flowCalculations";
import type { Plant } from "../types/diagram.types";

interface EnhanceNodeDataParams {
  node: any;
  devices: any[];
  nodesArray: any[];
  edgesArray: any[];
  plantId: string | null;
  currentPlant: Plant;
  isSidebarOpen: boolean;
}

export const enhanceNodeData = ({
  node,
  devices,
  nodesArray,
  edgesArray,
  plantId,
  currentPlant,
  isSidebarOpen,
}: EnhanceNodeDataParams): any => {
  let enhancedData = { ...node.data, unit: node.data.unit };

  if (node.type === "tank") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "tank" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      const flowTotals = calculateTankFlowTotals(
        node.id,
        devices as any[],
        nodesArray,
        edgesArray
      );

      enhancedData = {
        ...enhancedData,
        capacity: Number(matchingDevice?.params?.storageCapacity) || 0,
        currentLevel: Number(matchingDevice.last_record?.last_level) || 0,
        height: Number(matchingDevice?.params?.height) || 0,
        isActive: matchingDevice.device_status === "active",
        totalIn: flowTotals.totalIn,
        totalOut: flowTotals.totalOut,
        totalBalance: flowTotals.totalBalance,
        unit: matchingDevice.unit,
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
        lowerLimit: matchingDevice.params?.lowerLimit || "N/A",
        upperLimit: matchingDevice.params?.upperLimit || "N/A",
        crossSectionArea: matchingDevice.params?.crossSectionArea || 0,
        lastRecordTime: matchingDevice.last_record?.time || "N/A",
        reportType: matchingDevice.report_type || "N/A",
      };
    }
  } else if (node.type === "fm") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "fm" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        flowRate: Number(matchingDevice.last_record?.avg) || 0,
        totalizerReading: Number(matchingDevice.last_record?.max) || 0,
        isActive: matchingDevice.device_status === "active",
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        unit: matchingDevice.unit,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
        lowerLimit: matchingDevice.params?.lowerLimit || "N/A",
        upperLimit: matchingDevice.params?.upperLimit || "N/A",
        lastRecordTime: matchingDevice.last_record?.time || "N/A",
        reportType: matchingDevice.report_type || "N/A",
      };
    }
  } else if (node.type === "brwhms") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "brwhms" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        flowRate: Number(matchingDevice.last_record?.avg) || 0,
        totalizerReading: Number(matchingDevice.last_record?.max) || 0,
        isActive: matchingDevice.device_status === "active",
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        unit: matchingDevice.unit,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
        lowerLimit: matchingDevice.params?.lowerLimit || "N/A",
        upperLimit: matchingDevice.params?.upperLimit || "N/A",
        lastRecordTime: matchingDevice.last_record?.time || "N/A",
        reportType: matchingDevice.report_type || "N/A",
      };
    }
  } else if (node.type === "phmc") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "phmc" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        voltageR: Number(matchingDevice.last_record?.voltage_r) || 0,
        voltageY: Number(matchingDevice.last_record?.voltage_y) || 0,
        voltageB: Number(matchingDevice.last_record?.voltage_b) || 0,
        currentR: Number(matchingDevice.last_record?.Current_r) || 0,
        currentY: Number(matchingDevice.last_record?.Current_y) || 0,
        currentB: Number(matchingDevice.last_record?.Current_b) || 0,
        frequency: Number(matchingDevice.last_record?.Frequency) || 0,
        powerFactor: Number(matchingDevice.last_record?.power_factor) || 0,
        pumpStatus: matchingDevice.last_record?.pumpstatus || "0",
        batteryLevel: Number(matchingDevice.last_record?.BatteryLevel) || 0,
        isActive: matchingDevice.device_status === "active",
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        unit: matchingDevice.unit,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
        lowerLimit: matchingDevice.params?.lowerLimit || "N/A",
        upperLimit: matchingDevice.params?.upperLimit || "N/A",
        lastRecordTime: matchingDevice.last_record?.time || "N/A",
        reportType: matchingDevice.report_type || "N/A",
      };
    }
  } else if (node.type === "arg") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "arg" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        lastMm: Number(matchingDevice.last_record?.last_mm) || 0,
        maxMm: Number(matchingDevice.last_record?.max_mm) || 0,
        minMm: Number(matchingDevice.last_record?.min_mm) || 0,
        firstMm: Number(matchingDevice.last_record?.first_mm) || 0,
        isActive: matchingDevice.device_status === "active",
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        unit: matchingDevice.unit,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
        lowerLimit: matchingDevice.params?.lowerLimit || "N/A",
        upperLimit: matchingDevice.params?.upperLimit || "N/A",
        lastRecordTime: matchingDevice.last_record?.time || "N/A",
        reportType: matchingDevice.report_type || "N/A",
      };
    }
  } else if (node.type === "virtual") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "virtual" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        deviceType: matchingDevice.device_type || "Virtual Device",
        status:
          matchingDevice.device_status === "active" ? "active" : "inactive",
        value: 0,
        unit: matchingDevice?.unit,
        description: matchingDevice.report_type || "None",
        isActive: matchingDevice.device_status === "active",
        organizationConnection:
          matchingDevice.organization_connection === "none"
            ? ""
            : matchingDevice.organization_connection,
        systemName: matchingDevice.system_name,
        deviceId: matchingDevice.device_id,
        plantConnection: getPlantConnection(matchingDevice),
        departmentConnection: getDepartmentConnection(matchingDevice),
        systemConnection: getSystemConnection(matchingDevice),
      };
    }
  } else if (node.type === "resultant") {
    const matchingDevice = devices.find(
      (device: any) =>
        device.device_family_type === "virtual" &&
        device.device_type === "Resultant Reporting" &&
        device.device_name === node.data.label
    );

    if (matchingDevice) {
      enhancedData = {
        ...enhancedData,
        unit: matchingDevice.unit || "",
        isActive: matchingDevice.device_status === "active",
        deviceId: matchingDevice.device_id,
        label: matchingDevice.device_name,
        report_value: matchingDevice.device_reporting?.report_value ?? 0,
        reportType: matchingDevice.report_type || "N/A",
      };
    } else {
      enhancedData = {
        ...enhancedData,
        unit: devices[0]?.unit || "",
        label: node.data.label,
        report_value: 0,
        isActive: true,
      };
    }
  } else if (node.type === "group") {
    const isPlantGroup = node.id.startsWith("plant-");
    const isDepartmentGroup = node.id.startsWith("dept-");
    const isSystemGroup = node.id.startsWith("system-");

    if (isPlantGroup) {
      const plantTotals = calculatePlantTotals(devices, plantId || "");

      let totalStock = 0;
      let totalCapacity = 0;

      devices.forEach((device: any) => {
        if (device.device_family_type === "tank") {
          if (device.in_plant_id === Number(plantId)) {
            const capacity = Number(device.params?.storageCapacity) || 0;
            const currentLevel = Number(device.last_record?.last_level) || 0;
            const actualCurrentLevl =
              (Number(device?.params?.height) - Number(currentLevel)) *
              device?.params?.crossSectionArea;
            totalCapacity += capacity;
            totalStock += actualCurrentLevl;
          }
        }
      });

      enhancedData = {
        ...enhancedData,
        label: currentPlant.plant_name,
        totalStock: totalStock,
        totalCapacity: totalCapacity,
        totalIn: plantTotals.totalIn,
        totalOut: plantTotals.totalOut,
        totalBalance: plantTotals.totalBalance,
        plantTotalIn: plantTotals.totalIn,
        plantTotalOut: plantTotals.totalOut,
        plantTotalBalance: plantTotals.totalBalance,
        unit: devices[0]?.unit,
        groupType: "plant",
        plant_id: Number(plantId),
        id: Number(plantId),
        isSidebarOpen: isSidebarOpen,
      };
    } else if (isDepartmentGroup) {
      const departmentId = node?.id?.replace("dept-", "");

      const deptTotals = calculateDepartmentTotals(devices, departmentId);

      const departmentDevices = devices.filter(
        (device: any) => device.department_id.toString() === departmentId
      );

      const plantTotals = calculatePlantTotals(devices, plantId || "");

      const actualDepartmentName =
        departmentDevices.length > 0
          ? departmentDevices[0].department_name
          : node.data.label;

      let totalStock = 0;
      let totalCapacity = 0;

      departmentDevices.forEach((device: any) => {
        if (device.device_family_type === "tank") {
          if (device.in_department_id === Number(departmentId)) {
            const capacity = Number(device.params?.storageCapacity) || 0;
            const currentLevel = Number(device.last_record?.last_level) || 0;
            const actualCurrentLevl =
              (Number(device?.params?.height) - Number(currentLevel)) *
              device?.params?.crossSectionArea;
            totalCapacity += capacity;
            totalStock += actualCurrentLevl;
          }
        }
      });

      enhancedData = {
        ...enhancedData,
        label: actualDepartmentName,
        totalStock: totalStock,
        totalCapacity: totalCapacity,
        totalIn: deptTotals.totalIn,
        totalOut: deptTotals.totalOut,
        totalBalance: deptTotals.totalBalance,
        plantTotalIn: plantTotals.totalIn,
        plantTotalOut: plantTotals.totalOut,
        plantTotalBalance: plantTotals.totalBalance,
        unit: departmentDevices[0]?.unit,
        groupType: "department",
        department_id: Number(departmentId),
        id: Number(departmentId),
        isSidebarOpen: isSidebarOpen,
      };
    } else if (isSystemGroup) {
      const systemId = node?.id?.replace("system-", "");

      const systemTotals = calculateSystemTotals(devices, systemId);

      const plantTotals = calculatePlantTotals(devices, plantId || "");

      const systemDevices = devices.filter(
        (device: any) => device.system_id.toString() === systemId
      );

      const actualSystemName =
        systemDevices.length > 0
          ? systemDevices[0].system_name
          : node.data.label;

      let totalStock = 0;
      let totalCapacity = 0;

      systemDevices.forEach((device: any) => {
        if (device.device_family_type === "tank") {
          if (device.in_system_id === Number(systemId)) {
            const capacity = Number(device.params?.storageCapacity) || 0;
            const currentLevel = Number(device.last_record?.last_level) || 0;
            const actualCurrentLevl =
              (Number(device?.params?.height) - Number(currentLevel)) *
              device?.params?.crossSectionArea;
            totalCapacity += capacity;
            totalStock += actualCurrentLevl;
          }
        }
      });

      enhancedData = {
        ...enhancedData,
        label: actualSystemName,
        totalStock: totalStock,
        totalCapacity: totalCapacity,
        totalIn: systemTotals.totalIn,
        totalOut: systemTotals.totalOut,
        totalBalance: systemTotals.totalBalance,
        systemTotalIn: systemTotals.totalIn,
        systemTotalOut: systemTotals.totalOut,
        systemTotalBalance: systemTotals.totalBalance,
        plantTotalIn: plantTotals.totalIn,
        plantTotalOut: plantTotals.totalOut,
        plantTotalBalance: plantTotals.totalBalance,
        unit: systemDevices[0]?.unit,
        groupType: "system",
        system_id: Number(systemId),
        id: Number(systemId),
        isSidebarOpen: isSidebarOpen,
      };
    } else {
      enhancedData = {
        ...enhancedData,
        totalStock: 0,
        totalCapacity: 0,
        totalIn: 0,
        totalOut: 0,
        totalBalance: 0,
        unit: "Ltr",
        groupType: "department",
        isSidebarOpen: isSidebarOpen,
      };
    }
  }

  return enhancedData;
};
