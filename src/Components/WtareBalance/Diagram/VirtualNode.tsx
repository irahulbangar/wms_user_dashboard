import React from "react";
import { Handle, Position } from "@xyflow/react";

interface VirtualNodeProps {
  data: {
    label: string;
    deviceType: string;
    status: "active" | "inactive" | "maintenance";
    value?: number;
    unit?: string;
    description?: string;
    systemName?: string;
    systemConnection?: string;
    departmentConnection?: string;
    plantConnection?: string;
    organizationConnection?: string;
    reportType?: string;
  };
}

const VirtualNode: React.FC<VirtualNodeProps> = ({ data }) => {
  const systemName = data?.systemName || "";
  const systemConnection = data?.systemConnection || "";
  const departmentConnection = data?.departmentConnection || "";
  const plantConnection = data?.plantConnection || "";
  const organizationConnection = data?.organizationConnection || "";
  const reportType = data?.reportType || "";
  const connectionInfo = [
    `System Name: ${systemName}`,
    `Device Name: ${data.label}`,
    organizationConnection
      ? `Organization Conn. : ${organizationConnection}`
      : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    `Report Type: ${reportType}`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div className="relative">
      <div
        className={`rounded-lg shadow-lg p-3 min-w-[140px] bg-status-warning flex items-center justify-center text-text-primary relative`}
        title={connectionInfo}
      >
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-secondary border-2 border-border-secondary"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-secondary border-2 border-border-secondary"
        />

        <div className="text-left">
          <div className="text-sm font-normal font-roboto truncate">
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualNode;
