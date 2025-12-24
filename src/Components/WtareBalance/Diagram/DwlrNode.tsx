import { Handle, Position as HandlePosition } from "@xyflow/react";
import dwlrLogo from "../../../assets/images/dwlr-logo.png";
import { isRecordTimeOld } from "../../../utils/utils";

interface DwlrNodeProps {
  data: {
    label: string;
    unit?: string;
    isActive?: boolean;
    waterColumn: number;
    waterTemperature: number;
    waterPressure: number;
    ambientTemperature: number;
    ambientPressure: number;
    waterColumnFromGround: number;
    sensorVoltage: number;
    batteryVoltage: number;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    lastRecordTime: string;
    reportType: string;
    maxThreshold?: number;
  };
}

const DwlrNode = ({ data }: DwlrNodeProps) => {
  const unit = data?.unit || "";
  const isActive = data.isActive !== false;
  const waterColumn = Number(data.waterColumn) || 0;
  const waterTemperature = Number(data.waterTemperature) || 0;
  const waterPressure = Number(data.waterPressure) || 0;
  const ambientTemperature = Number(data.ambientTemperature) || 0;
  const batteryVoltage = Number(data.batteryVoltage) || 0;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "N/A";
  const systemName = data.systemName || "N/A";
  const systemConnection = data.systemConnection || "";
  const lastRecordTime = data.lastRecordTime || "N/A";
  const reportType = data.reportType || "N/A";

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

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
    `Water Column: ${waterColumn?.toFixed(2)} ${unit}`,
    `Water Temp: ${waterTemperature?.toFixed(1)}°C`,
    `Water Pressure: ${waterPressure?.toFixed(2)} ${unit}`,
    `Ambient Temp: ${ambientTemperature?.toFixed(1)}°C`,
    `Battery: ${batteryVoltage?.toFixed(1)}V`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div
      className={`relative w-22 h-fit bg-primary/20 border rounded-md p-1 z-50 group ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm text-left mb-1 font-roboto text-text-primary text-wrap z-10 px-1 leading-4">
        {data.label}
      </div>

      <div className="flex items-center justify-center">
        <img
          src={dwlrLogo}
          alt="DWLR"
          className="w-16 h-16 object-contain flex items-center justify-center"
        />
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

      <div className="flex items-start justify-start absolute -bottom-14 flex-col left-1/2 transform -translate-x-1/2 w-full px-1">
        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">
            Water Col:
          </div>
          <div className="text-status-info font-roboto text-xs truncate">
            {waterColumn.toFixed(2)} (mWc)
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">Temp:</div>
          <div className="text-text-primary font-roboto text-xs">
            {waterTemperature.toFixed(1)}°C
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">
            Pressure:
          </div>
          <div className="text-text-primary font-roboto text-xs">
            {waterPressure.toFixed(2)}(Bar)
          </div>
        </div>
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

export default DwlrNode;
