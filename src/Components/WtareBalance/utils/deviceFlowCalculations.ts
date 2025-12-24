import type { DepartmentTotals } from "../types/diagram.types";

export const calculateDepartmentTotals = (
  devices: any[],
  targetDepartmentId: string
): DepartmentTotals => {
  const deptTotals: DepartmentTotals = {
    totalStock: 0,
    totalCapacity: 0,
    totalIn: 0,
    totalOut: 0,
    totalBalance: 0,
  };

  devices.forEach((device) => {
    if (device?.device_family_type === "tank") {
      const capacity = Number(device.params?.storageCapacity) || 0;
      const currentLevel = Number(device.last_record?.last_level) || 0;
      deptTotals.totalCapacity += capacity;
      deptTotals.totalStock += currentLevel;
    }
  });

  devices.forEach((device) => {
    let flowValue = 0;

    if (device.device_family_type === "fm") {
      flowValue = Number(device.last_record?.max) || 0;
    } else if (device.device_family_type === "brwhms") {
      flowValue = Number(device.last_record?.total) || 0;
    } else if (device.device_family_type === "bdwfms") {
      flowValue = Number(device.last_record?.total) || 0;
    } else if (
      device.device_family_type === "phmc" &&
      device.device_type === "New phmc"
    ) {
      flowValue = Number(device.last_record?.flowrate) || 0;
    }

    if (device.in_department_id?.toString() === targetDepartmentId) {
      deptTotals.totalIn += flowValue;
    }

    if (device.out_department_id?.toString() === targetDepartmentId) {
      deptTotals.totalOut += flowValue;
    }
  });

  deptTotals.totalBalance = deptTotals.totalIn - deptTotals.totalOut;

  return deptTotals;
};

export const calculatePlantTotals = (
  devices: any[],
  targetPlantId: string
): DepartmentTotals => {
  const plantTotals: DepartmentTotals = {
    totalStock: 0,
    totalCapacity: 0,
    totalIn: 0,
    totalOut: 0,
    totalBalance: 0,
  };

  devices.forEach((device) => {
    if (device.device_family_type === "tank") {
      const capacity = Number(device.params?.storageCapacity) || 0;
      const currentLevel = Number(device.last_record?.last_level) || 0;
      plantTotals.totalCapacity += capacity;
      plantTotals.totalStock += currentLevel;
    }
  });

  devices.forEach((device) => {
    let flowValue = 0;

    if (device.device_family_type === "fm") {
      flowValue = Number(device.last_record?.max) || 0;
    } else if (device.device_family_type === "brwhms") {
      flowValue = Number(device.last_record?.total) || 0;
    } else if (device.device_family_type === "bdwfms") {
      flowValue = Number(device.last_record?.total) || 0;
    } else if (
      device.device_family_type === "phmc" &&
      device.device_type === "New phmc"
    ) {
      flowValue = Number(device.last_record?.flowrate) || 0;
    }

    if (device.in_plant_id?.toString() === targetPlantId) {
      plantTotals.totalIn += flowValue;
    }

    if (device.out_plant_id?.toString() === targetPlantId) {
      plantTotals.totalOut += flowValue;
    }
  });

  plantTotals.totalBalance = plantTotals.totalIn - plantTotals.totalOut;

  return plantTotals;
};
