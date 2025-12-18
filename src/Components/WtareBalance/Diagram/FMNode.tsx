import { Handle, Position as HandlePosition } from "@xyflow/react";
import fmLogo from "../../../assets/images/fm-logo.svg";
import { isRecordTimeOld } from "../../../utils/utils";

interface FMNodeProps {
  data: {
    label: string;
    unit?: string;
    isActive?: boolean;
    totalizerReading: number;
    flowRate: number;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    lowerLimit: string;
    lastRecordTime: string;
    reportType: string;
  };
}

const FMNode = ({ data }: FMNodeProps) => {
  const unit = data?.unit;
  const isActive = data.isActive !== false;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const flowRate = Number(data.flowRate) || 0;
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
    organizationConnection
      ? `Org Conn. : ${organizationConnection}`
      : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Report Type: ${reportType}`,
    `Totalizer: ${totalizerReading} ${unit}`,
    `Flow: ${flowRate} LPM`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div
      className={`relative w-fit h-fit bg-primary/20 border rounded-md p-1 z-50 group ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm text-left mb-1 font-roboto text-text-primary text-wrap z-10 px-1 leading-4">
        {data.label}
      </div>

      <div className="flex items-center justify-center">
        <img
          src={fmLogo}
          alt="FM"
          className="w-12 h-12 object-contain flex items-center justify-center"
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
      {/* <div
        className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
          totalizerReading > Number(lowerLimit) ? "bg-status-danger animate-pulse" : "bg-status-success animate-pulse"
        }`}
        title={`
Totalizer Reading: ${totalizerReading} ${unit}
Lower Limit: ${lowerLimit} ${unit}`}
      /> */}

      <div className="flex items-start justify-start absolute -bottom-11 flex-col left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center gap-1">
          <div className="text-text-secondary font-roboto text-sm whitespace-nowrap">
            Flow :
          </div>
          <div className="text-status-info font-roboto text-sm truncate px-1">
            {flowRate} LPM
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 whitespace-nowrap font-roboto truncate z-10 leading-4">
          <div className="text-text-secondary font-roboto text-sm">
            Total :{" "}
          </div>
          <div className="text-text-primary font-roboto text-sm">
            {unit === "M^3"
              ? (totalizerReading / 1000).toFixed(2)
              : totalizerReading}{" "}
            {unit}
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

export default FMNode;
