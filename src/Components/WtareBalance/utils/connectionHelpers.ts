export const getSystemConnection = (matchingDevice: any): string => {
  const inSystemId = matchingDevice.in_system_id;
  const outSystemId = matchingDevice.out_system_id;

  const inSystemName = matchingDevice.in_system_name || "";
  const outSystemName = matchingDevice.out_system_name || "";

  if (inSystemId === null && outSystemId === null) {
    return "";
  }
  if (inSystemId && outSystemId) {
    if (inSystemName && outSystemName) {
      return `${inSystemName}, ${outSystemName}`;
    }
    return "Both";
  }
  if (inSystemId && !outSystemId) {
    return inSystemName || "In";
  }
  if (!inSystemId && outSystemId) {
    return outSystemName || "Out";
  }
  return "None";
};

export const getPlantConnection = (matchingDevice: any): string => {
  const inPlantId = matchingDevice.in_plant_id;
  const outPlantId = matchingDevice.out_plant_id;

  const inPlantName = matchingDevice.in_plant_name || "";
  const outPlantName = matchingDevice.out_plant_name || "";

  if (inPlantId === null && outPlantId === null) {
    return "";
  }
  if (inPlantId && outPlantId) {
    if (inPlantName && outPlantName) {
      return `${inPlantName}, ${outPlantName}`;
    }
    return "Both";
  }
  if (inPlantId && !outPlantId) {
    return inPlantName || "In";
  }
  if (!inPlantId && outPlantId) {
    return outPlantName || "Out";
  }
  return "None";
};

export const getDepartmentConnection = (matchingDevice: any): string => {
  const inDepartmentId = matchingDevice.in_department_id;
  const outDepartmentId = matchingDevice.out_department_id;

  const inDepartmentName = matchingDevice.in_department_name || "";
  const outDepartmentName = matchingDevice.out_department_name || "";

  if (inDepartmentId === null && outDepartmentId === null) {
    return "";
  }
  if (inDepartmentId && outDepartmentId) {
    if (inDepartmentName && outDepartmentName) {
      return `${inDepartmentName}, ${outDepartmentName}`;
    }
    return "Both";
  }
  if (inDepartmentId && !outDepartmentId) {
    return inDepartmentName || "In";
  }
  if (!inDepartmentId && outDepartmentId) {
    return outDepartmentName || "Out";
  }
  return "None";
};
