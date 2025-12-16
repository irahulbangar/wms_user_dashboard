import { Handle, Position as HandlePosition } from "@xyflow/react";
import phmcLogo from "../../../assets/images/phmc-logo.png";
import { isRecordTimeOld } from "../../../utils/utils";

interface PHMCNodeProps {
  data: {
    label: string;
    isActive?: boolean;
    voltageR: number;
    voltageY: number;
    voltageB: number;
    currentR: number;
    currentY: number;
    currentB: number;
    pumpStatus: string;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    lastRecordTime: string;
    reportType: string;
  };
}

const PHMCNode = ({ data }: PHMCNodeProps) => {
  const isActive = data.isActive !== false;
  const voltageR = Number(data.voltageR) || 0;
  const voltageY = Number(data.voltageY) || 0;
  const voltageB = Number(data.voltageB) || 0;
  const currentR = Number(data.currentR) || 0;
  const currentY = Number(data.currentY) || 0;
  const currentB = Number(data.currentB) || 0;
  const pumpStatus = data.pumpStatus || "0";
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "N/A";
  const systemName = data.systemName || "N/A";
  const systemConnection = data.systemConnection || "";
  const isPumpRunning = pumpStatus === "1" ? "ON" : "OFF";
  const lastRecordTime = data.lastRecordTime || "N/A";
  const reportType = data.reportType || "N/A";
  const recordTimeOld = isRecordTimeOld(lastRecordTime);

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-border-primary";

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${data.label}`,
    organizationConnection
      ? `Organization Conn. : ${organizationConnection}`
      : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Report Type : ${reportType}`,
    `Voltage R : ${voltageR / 10} V`,
    `Voltage Y : ${voltageY / 10} V`,
    `Voltage B : ${voltageB / 10} V`,
    `Current R : ${currentR} A`,
    `Current Y : ${currentY} A`,
    `Current B : ${currentB} A`,
    `Pump Status : ${isPumpRunning}`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div
      className={`relative h-52 bg-primary/20 border rounded-md p-1 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm text-left font-roboto text-text-primary text-wrap z-10 px-1 leading-4">
        {data.label}
      </div>

      <div className="flex items-center justify-center">
        <img src={phmcLogo} alt="PHMC" className="w-12 h-12 object-contain" />
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

      <div className="text-xs text-center mb-0.5">
        <div className="text-text-secondary font-roboto">Voltage (V)</div>
        <div className="flex justify-around text-xs">
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">R</span>
            <span className="text-status-danger font-roboto">
              {voltageR / 10}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">Y</span>
            <span className="text-status-warning font-roboto">
              {voltageY / 10}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">B</span>
            <span className="text-status-info font-roboto">
              {voltageB / 10}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-center mb-0.5">
        <div className="text-text-secondary font-roboto">Current (A)</div>
        <div className="flex justify-around text-xs">
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">R</span>
            <span className="text-status-danger font-roboto">{currentR}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">Y</span>
            <span className="text-status-warning font-roboto">{currentY}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-secondary font-roboto">B</span>
            <span className="text-status-info font-roboto">{currentB}</span>
          </div>
        </div>
      </div>

      <div
        className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap font-roboto truncate z-10 px-1"
        title={data.label}
      >
        <div>Pump Status: {isPumpRunning}</div>
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

export default PHMCNode;
