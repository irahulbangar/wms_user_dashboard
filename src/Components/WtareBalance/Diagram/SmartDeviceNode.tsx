import { Handle, Position as HandlePosition } from "@xyflow/react";
import { isRecordTimeOld } from "../../../utils/utils";
import smartDeviceIcon from "../../../assets/images/smart-logo.png";
import type { DisplayParams } from "../../../../model/devices.interface";

interface SmartDeviceNodeProps {
  data: {
    label: string;
    unit?: string;
    isActive?: boolean;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    lastRecordTime: string;
    reportType: string;
    displayParams: DisplayParams[];
  };
}

const SmartDeviceNode = ({ data }: SmartDeviceNodeProps) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "N/A";
  const systemName = data.systemName || "N/A";
  const systemConnection = data.systemConnection || "";
  const lastRecordTime = data.lastRecordTime || "N/A";
  const reportType = data.reportType || "N/A";
  const recordTimeOld = isRecordTimeOld(lastRecordTime);
  const displayParams = (data.displayParams || []).filter(
    (param) => param.diagram_visible === 1 && param.report_visible !== 0
  );

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-border-primary";

  const connectionInfo = [
    `System Name: ${systemName}`,
    `Device Name: ${data.label}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Report Type: ${reportType}`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div
      className={`relative w-32 h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-10 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm font-normal text-left font-roboto text-wrap mb-1 px-1 text-text-primary leading-4">
        {data.label}
      </div>

      <div className="flex justify-center items-center">
        <img
          src={smartDeviceIcon}
          alt="smart-device"
          className="w-12 h-12 object-contain"
        />
      </div>

      <div className="flex flex-col mt-1">
        {displayParams.map((param) => (
          <div
            key={param.name}
            className="text-sm font-normal text-left font-roboto text-wrap px-1 text-text-primary leading-4 whitespace-nowrap"
          >
            {param.name} :{" "}
            <span className="italic text-xs">({param.unit})</span>
          </div>
        ))}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          recordTimeOld
            ? "bg-status-danger animate-pulse"
            : isActive
            ? "bg-status-success animate-pulse"
            : "bg-status-danger"
        }`}
      />

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-info"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-info"
      />
    </div>
  );
};

export default SmartDeviceNode;
