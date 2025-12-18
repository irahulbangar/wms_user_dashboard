import { Handle, Position as HandlePosition } from "@xyflow/react";
import argLogo from "../../../assets/images/arg-logo.png";
import { isRecordTimeOld } from "../../../utils/utils";

interface ARGNodeProps {
  data: {
    label: string;
    unit?: string;
    isActive?: boolean;
    lastMm: number;
    maxMm: number;
    minMm: number;
    firstMm: number;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    lastRecordTime: string;
    reportType: string;
  };
}

const ARGNode = ({ data }: ARGNodeProps) => {
  const unit = data.unit || "mm";
  const isActive = data.isActive !== false;
  const lastMm = Number(data.lastMm) || 0;
  const maxMm = Number(data.maxMm) || 0;
  const minMm = Number(data.minMm) || 0;
  const firstMm = Number(data.firstMm) || 0;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "N/A";
  const systemName = data.systemName || "N/A";
  const systemConnection = data.systemConnection || "";
  const lastRecordTime = data.lastRecordTime || "N/A";
  const reportType = data.reportType || "N/A";

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

  const totalRainfall = maxMm - minMm;

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-border-primary";

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${data.label}`,
    organizationConnection
      ? `Org Conn. : ${organizationConnection}`
      : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Report Type : ${reportType}`,
    `Total Rainfall : ${totalRainfall} ${unit}`,
    `Max : ${maxMm}`,
    `Min : ${minMm}`,
    `First : ${firstMm}`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div
      className={`relative w-fit h-fit bg-primary/20 border rounded-md p-1 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm text-left mb-1 font-roboto text-text-primary text-wrap z-10 px-1 leading-4">
        {data.label}
      </div>

      <div className="flex items-center justify-center">
        <img src={argLogo} alt="ARG" className="w-8 h-8 object-contain" />
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

      <div className="text-sm text-center mb-1">
        <div className="text-text-secondary font-roboto">Rainfall:</div>
        <div className="font-normal text-status-info font-roboto">
          {lastMm} {unit}
        </div>
      </div>

      <div className="text-sm text-center">
        <div className="text-text-secondary font-roboto">
          Total: {totalRainfall.toFixed(1)} {unit}
        </div>
        <div className="text-text-secondary font-roboto">
          Max: {maxMm} | Min: {minMm} | First: {firstMm}
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap font-roboto truncate z-10 px-1">
        <div>ARG - Rain Gauge</div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-success"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-success"
      />
    </div>
  );
};

export default ARGNode;
