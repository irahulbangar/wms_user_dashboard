export interface Device {
  device_id: number;
  device_name: string;
  device_type: "tank" | "fm";
  device_status: "active" | "inactive";
  department_id: number;
  params?: {
    storageCapacity?: number;
    height?: number;
  };
  last_record?: {
    min_avg?: number;
    min_max?: number;
    min_last_level?: number;
  };
}

export interface Plant {
  plant_id: number;
  plant_name: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: string;
  type: "tank" | "fm" | "group";
  data: {
    label: string;
    unit?: string;
    currentLevel?: number;
    capacity?: number;
    height?: number;
    isActive?: boolean;
    flowRate?: number;
    totalizerReading?: number;
    totalStock?: number;
    totalCapacity?: number;
    totalIn?: number;
    totalOut?: number;
    totalBalance?: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface FlowTotals {
  totalIn: number;
  totalOut: number;
  totalBalance: number;
}

export interface DepartmentTotals {
  totalStock: number;
  totalCapacity: number;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
}
