import type { FlowTotals, DepartmentTotals } from "../types/diagram.types";

/**
 * Calculate flow totals for a specific tank node
 */
export const calculateTankFlowTotals = (
  tankNodeId: string,
  devices: any[],
  nodesArray: any[],
  edges: any[]
): FlowTotals => {
  let totalIn = 0;
  let totalOut = 0;

  const nodeIdToDeviceName = new Map();
  nodesArray.forEach((node: any) => {
    if (node.data && node.data.label) {
      nodeIdToDeviceName.set(node.id, node.data.label);
    }
  });

  const fmDevices = devices.filter(
    (device) => device.device_family_type === "fm"
  );

  const incomingEdges = edges.filter((edge: any) => edge.target === tankNodeId);
  incomingEdges.forEach((edge: any) => {
    const sourceDeviceName = nodeIdToDeviceName.get(edge.source);
    const sourceFM = fmDevices.find(
      (device) => device.device_name === sourceDeviceName
    );

    if (sourceFM) {
      const flowRate = Number(sourceFM.last_record?.max) || 0;
      totalIn += flowRate;
    }
  });

  const outgoingEdges = edges.filter((edge: any) => edge.source === tankNodeId);
  outgoingEdges.forEach((edge: any) => {
    const targetDeviceName = nodeIdToDeviceName.get(edge.target);
    const targetFM = fmDevices.find(
      (device) => device.device_name === targetDeviceName
    );

    if (targetFM) {
      const flowRate = Number(targetFM.last_record?.max) || 0;
      totalOut += flowRate;
    }
  });

  const totalBalance = totalIn - totalOut;

  return { totalIn, totalOut, totalBalance };
};

/**
 * Calculate department totals for group nodes
 */
export const calculateDepartmentTotals = (
  departmentDevices: any[],
  plantEdges: any[],
  nodesArray: any[],
  allDevices: any[]
): DepartmentTotals => {
  const deptTotals: DepartmentTotals = {
    totalStock: 0,
    totalCapacity: 0,
    totalIn: 0,
    totalOut: 0,
    totalBalance: 0,
  };

  departmentDevices.forEach((device) => {
    if (device.device_family_type === "tank") {
      const capacity = Number(device.params?.storageCapacity) || 0;
      const currentLevel = Number(device.last_record?.last_level) || 0;
      deptTotals.totalCapacity += capacity;
      deptTotals.totalStock += currentLevel;
    }
  });

  const departmentTanks = departmentDevices.filter(
    (device) => device.device_family_type === "tank"
  );
  const departmentFMs = departmentDevices.filter(
    (device) => device.device_family_type === "fm"
  );

  let totalIn = 0;
  let totalOut = 0;

  const nodeIdToDeviceName = new Map();
  nodesArray.forEach((node: any) => {
    if (node.data && node.data.label) {
      nodeIdToDeviceName.set(node.id, node.data.label);
    }
  });

  departmentTanks.forEach((tank: any) => {
    const tankDeviceName = tank.device_name;
    const tankNodeId = Array.from(nodeIdToDeviceName.entries()).find(
      ([_, deviceName]) => deviceName === tankDeviceName
    )?.[0];

    if (tankNodeId) {
      const incomingEdges = plantEdges.filter(
        (edge: any) => edge.target === tankNodeId
      );

      incomingEdges.forEach((edge: any) => {
        const sourceDeviceName = nodeIdToDeviceName.get(edge.source);
        const sourceFM = departmentFMs.find(
          (fm: any) => fm.device_name === sourceDeviceName
        );

        if (sourceFM) {
          const flowRate = Number(sourceFM.last_record?.max) || 0;
          totalIn += flowRate;
        }
      });
    }
  });

  departmentTanks.forEach((tank: any) => {
    const tankDeviceName = tank.device_name;
    const tankNodeId = Array.from(nodeIdToDeviceName.entries()).find(
      ([_, deviceName]) => deviceName === tankDeviceName
    )?.[0];

    if (tankNodeId) {
      const outgoingEdges = plantEdges.filter(
        (edge: any) => edge.source === tankNodeId
      );

      outgoingEdges.forEach((edge: any) => {
        const targetDeviceName = nodeIdToDeviceName.get(edge.target);
        const targetFM = allDevices.find(
          (device: any) =>
            device.device_family_type === "fm" &&
            device.device_name === targetDeviceName
        );

        if (targetFM) {
          const flowRate = Number(targetFM.last_record?.max) || 0;
          totalOut += flowRate;
        }
      });
    }
  });

  deptTotals.totalIn = totalIn;
  deptTotals.totalOut = totalOut;
  deptTotals.totalBalance = totalIn - totalOut;

  return deptTotals;
};

/**
 * Calculate system totals for system-wise group nodes
 */
export const calculateSystemTotals = (
  systemDevices: any[],
  targetSystemId: string
): DepartmentTotals => {
  const systemTotals: DepartmentTotals = {
    totalStock: 0,
    totalCapacity: 0,
    totalIn: 0,
    totalOut: 0,
    totalBalance: 0,
  };

  systemDevices.forEach((device) => {
    if (device.device_family_type === "tank") {
      const capacity = Number(device.params?.storageCapacity) || 0;
      const currentLevel = Number(device.last_record?.last_level) || 0;
      systemTotals.totalCapacity += capacity;
      systemTotals.totalStock += currentLevel;
    }
  });

  systemDevices.forEach((device) => {
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

    if (device.in_system_id?.toString() === targetSystemId) {
      systemTotals.totalIn += flowValue;
    }

    if (device.out_system_id?.toString() === targetSystemId) {
      systemTotals.totalOut += flowValue;
    }
  });

  systemTotals.totalBalance = systemTotals.totalIn - systemTotals.totalOut;

  return systemTotals;
};
